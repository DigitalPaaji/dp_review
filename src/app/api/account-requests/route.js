import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Client from "@/models/Client";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import otpModel from "@/models/otpModel";


import { randomInt } from "node:crypto";


export const runtime = "nodejs";

const OTP_EXPIRY_MINUTES = 5;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_APP_PASSWORD,
  },
});

export async function POST(req) {
  let email;
  let otp;

  try {
    await connectDB();

    // 1. Parse request
    const body = await req.json();

    email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    const businessName =
      typeof body.businessName === "string"
        ? body.businessName.trim()
        : "";

    // 2. Validate required fields
    if (!email || !password || !businessName) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, password and business name are required.",
        },
        { status: 400 }
      );
    }

    // 3. Validate lengths
    if (
      email.length > 254 ||
      businessName.length > 150 ||
      password.length > 128
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "One or more fields exceed the allowed length.",
        },
        { status: 400 }
      );
    }

    // 4. Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please enter a valid email address.",
        },
        { status: 400 }
      );
    }

    // 5. Validate password
    if (password.length < 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 8 characters long.",
        },
        { status: 400 }
      );
    }


    const alreadyExists = await Client.findOne({ email });

    if (alreadyExists) {
      return NextResponse.json(
        {
          success: false,
          message: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    // 7. Check email configuration
    if (
      !process.env.SMTP_EMAIL ||
      !process.env.SMTP_APP_PASSWORD
    ) {
      console.error("SMTP credentials are not configured.");

      return NextResponse.json(
        {
          success: false,
          message: "Email service is currently unavailable.",
        },
        { status: 500 }
      );
    }

    // 8. Generate secure 6-digit OTP
    otp = randomInt(100000, 1000000).toString();

    const expiryDate = new Date(
      Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    );

    // 9. Save OTP before sending email
    await otpModel.findOneAndUpdate(
      { email },
      {
        $set: {
          email,
          otp,
          expiryDate,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    // 10. Send OTP email
    try {
      await transporter.sendMail({
        from: `"Digital Paaji" <${process.env.SMTP_EMAIL}>`,
        to: email,
        subject: "Verify Your Email Address | Digital Paaji",

        text: `
Hello,

Thank you for choosing Digital Paaji!

Your email verification code is: ${otp}

This code expires in 5 minutes.

For your security, never share this code with anyone.

If you did not request this code, you can safely ignore this email.

Best regards,
Digital Paaji Team
        `.trim(),

        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification</title>
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
    style="background:#f4f5f7;padding:35px 12px;">
    <tr>
      <td align="center">

        <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
          style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">

          <tr>
            <td style="background:#111827;padding:28px 24px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:25px;letter-spacing:1px;">
                Digital Paaji
              </h1>
              <p style="margin:8px 0 0;color:#d1d5db;font-size:13px;">
                Smart Solutions for Your Business
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:36px 30px 24px;">

              <h2 style="margin:0 0 18px;font-size:23px;color:#111827;">
                Verify Your Email Address
              </h2>

              <p style="margin:0 0 16px;font-size:15px;line-height:1.8;color:#4b5563;">
                Hello,
              </p>

              <p style="margin:0 0 24px;font-size:15px;line-height:1.8;color:#4b5563;">
                Thank you for choosing Digital Paaji. Use the verification
                code below to continue creating your business account.
              </p>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0"
                style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
                <tr>
                  <td align="center" style="padding:25px 12px;">

                    <p style="margin:0 0 14px;color:#6b7280;font-size:12px;font-weight:bold;letter-spacing:2px;">
                      YOUR VERIFICATION CODE
                    </p>

                    <div style="color:#111827;font-size:34px;font-weight:bold;letter-spacing:8px;padding-left:8px;">
                      ${otp}
                    </div>

                    <p style="margin:18px 0 0;color:#dc2626;font-size:13px;font-weight:bold;">
                      Expires in 5 minutes
                    </p>

                  </td>
                </tr>
              </table>

              <p style="margin:24px 0 16px;font-size:14px;line-height:1.8;color:#4b5563;">
                Enter this code on the verification page to complete the
                email verification step.
              </p>

              <p style="margin:0;font-size:13px;line-height:1.8;color:#6b7280;">
                <strong>Security tip:</strong> Never share your verification
                code with anyone. Digital Paaji will never ask you to disclose it.
              </p>

              <p style="margin:24px 0 0;font-size:13px;line-height:1.8;color:#6b7280;">
                If you did not request this code, you can safely ignore this email.
              </p>

            </td>
          </tr>

          <tr>
            <td style="padding:22px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0 0 8px;color:#374151;font-size:13px;font-weight:bold;">
                Digital Paaji Team
              </p>
              <p style="margin:0;color:#9ca3af;font-size:11px;line-height:1.7;">
                This is an automated email. Please do not reply directly to this message.
              </p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
        `,
      });
    } catch (mailError) {
      // Remove this OTP if the email could not be sent.
      await otpModel.deleteOne({ email, otp }).catch(() => {});

      throw mailError;
    }

    // 11. Success response
    return NextResponse.json(
      {
        success: true,
        message: "Verification OTP sent successfully. Please check your email.",
        expiresIn: OTP_EXPIRY_MINUTES * 60,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Registration OTP error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to send the verification code right now. Please try again.",
      },
      { status: 500 }
    );
  }
}
