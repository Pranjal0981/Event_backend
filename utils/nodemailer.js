const nodemailer = require('nodemailer');
const ErrorHandler = require('./ErrorHandler');

exports.sendmail = async (req, res, next, otp) => {
    try {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // Use SSL
            auth: {
                user: process.env.MAIL_EMAIL,
                pass: process.env.MAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: 'Event App <noreply@eventapp.com>',
            to: req.body.email,
            subject: 'Password Reset Request',
            html: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Password Reset Request</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            margin: 0;
                            padding: 0;
                            background-color: #000000;
                            color: #ffffff;
                        }
                        .container {
                            width: 100%;
                            max-width: 600px;
                            margin: 0 auto;
                            background-color: #1a1a1a;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                        }
                        .header {
                            background-color: #ff4d4d;
                            padding: 20px;
                            text-align: center;
                        }
                        .header h1 {
                            color: #ffffff;
                            font-size: 24px;
                            margin: 0;
                        }
                        .content {
                            padding: 20px;
                            text-align: center;
                        }
                        .content p {
                            font-size: 16px;
                            line-height: 1.5;
                            margin-bottom: 20px;
                            color: #ffffff;
                        }
                        .otp {
                            font-size: 36px;
                            font-weight: bold;
                            color: #ff4d4d;
                            margin: 20px 0;
                            padding: 10px;
                            background-color: #333;
                            border-radius: 5px;
                            color: #ffffff; /* Ensure OTP text is white */
                        }
                        .footer {
                            background-color: #1a1a1a;
                            padding: 20px;
                            text-align: center;
                            font-size: 14px;
                            color: #888888;
                            border-top: 1px solid #333;
                        }
                        .footer p {
                            margin: 5px 0;
                            color: #ffffff; /* Ensure footer text is white */
                        }
                        @media (max-width: 600px) {
                            .container {
                                width: 100%;
                                border-radius: 0;
                            }
                            .header h1 {
                                font-size: 20px;
                            }
                            .content p {
                                font-size: 14px;
                            }
                            .otp {
                                font-size: 30px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Password Reset Request</h1>
                        </div>
                        <div class="content">
                            <p>Hi there,</p>
                            <p>We received a request to reset your password. Please use the following OTP to proceed:</p>
                            <div class="otp">${otp}</div>
                            <p>If you did not request a password reset, please ignore this email.</p>
                        </div>
                        <div class="footer">
                            <p>Thank you,<br>Event App Team</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        // Send the email
        const info = await transport.sendMail(mailOptions);

        if (process.env.NODE_ENV === 'development') {
            console.log('Email sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }

        // Send response only once
        if (!res.headersSent) {
            return res.status(200).json({
                message: 'Email sent successfully',
                otp
            });
        }

    } catch (err) {
        // Handle errors and send a response only if headers are not sent
        if (!res.headersSent) {
            return next(new ErrorHandler(err.message || 'Failed to send email', 500));
        }
    }
};
