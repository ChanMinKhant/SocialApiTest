//nodemailer for email sent

const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jiyonfire@gmail.com',
    pass: 'qtql xexe oajn alto',
  },
});

var mailOptions = {
  from: 'jiyonfire@gmail.com',
  to: 'sayagyi226@gmail.com',
  subject: '',
  html: `  <!DOCTYPE html>
  <html>
  <body>
    <div
      style="
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.2);
        width: 400px;
        text-align: center;
      "
    >
      <h2 style="font-size: 24px; font-weight: bold; color: #333">
        Reset Your Password
      </h2>
      <p style="font-size: 16px; color: #666">Dear [User],</p>
      <p style="font-size: 16px; color: #666">
        We noticed that you recently requested to reset your password for your
        account. If you did not make this request,
        please disregard this email. No changes will be made to your account.
      </p>
      <p style="font-size: 16px; color: #666">
        To reset your password, click the button below. If you're unable to see
        the button, please copy and paste the following URL into your web
        browser:
      </p>
      <a
        href=""
        style="
          display: inline-block;
          padding: 10px 20px;
          margin-top: 10px;
          background-color: #007bff;
          color: #fff;
          text-decoration: none;
          border-radius: 5px;
          transition: background-color 0.3s;
        "
        >Reset Password</a
      >

      <p style="font-size: 16px; color: #666">
      
        For security reasons, this link will expire in [10min], so
        please reset your password promptly.
      </p>
      <p style="font-size: 16px; color: #666">
        If you did make this request, please click the button and follow the
        instructions to set your new password. Your account security is
        important to us, so be sure to choose a strong, unique password.
      </p>
      <p style="font-size: 16px; color: #666">
        Thank you for choosing [Your Company Name]!
      </p>
      <p style="font-size: 16px; color: #666">
        Best Regards,<br />The [Team] Team
      </p>
    </div>
  </body>
</html>
`,
};

// Add your email credentials and sending logic here.

transporter.sendMail(mailOptions, function (error, info) {
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
