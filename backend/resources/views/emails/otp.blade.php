<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode OTP — AquaMonitor</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#06b6d4,#0891b2);padding:32px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">🌊 AquaMonitor</h1>
                            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:13px;">Sistem Monitoring Kualitas Air IoT</p>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <p style="margin:0 0 16px;color:#334155;font-size:15px;">Halo <strong>{{ $userName }}</strong>,</p>
                            <p style="margin:0 0 24px;color:#64748b;font-size:14px;line-height:1.6;">
                                Kami menerima permintaan untuk mereset password akun Anda. Gunakan kode OTP di bawah ini untuk melanjutkan proses reset password.
                            </p>

                            <!-- OTP Code -->
                            <div style="text-align:center;margin:32px 0;">
                                <div style="display:inline-block;background:#f0fdfa;border:2px dashed #06b6d4;border-radius:12px;padding:20px 48px;">
                                    <p style="margin:0 0 4px;color:#64748b;font-size:12px;text-transform:uppercase;letter-spacing:2px;">Kode OTP</p>
                                    <p style="margin:0;color:#0891b2;font-size:36px;font-weight:800;letter-spacing:8px;font-family:'Courier New',monospace;">{{ $otp }}</p>
                                </div>
                            </div>

                            <p style="margin:0 0 8px;color:#64748b;font-size:13px;text-align:center;">
                                ⏱️ Kode ini berlaku selama <strong>10 menit</strong>.
                            </p>
                            <p style="margin:0 0 32px;color:#94a3b8;font-size:12px;text-align:center;">
                                Jika Anda tidak meminta reset password, abaikan email ini.
                            </p>

                            <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">

                            <p style="margin:0;color:#94a3b8;font-size:11px;text-align:center;line-height:1.5;">
                                Email ini dikirim secara otomatis oleh sistem AquaMonitor.<br>
                                Jangan bagikan kode OTP ini kepada siapa pun.
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
                            <p style="margin:0;color:#94a3b8;font-size:11px;">
                                © {{ date('Y') }} AquaMonitor — Capstone Project Universitas Diponegoro
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
