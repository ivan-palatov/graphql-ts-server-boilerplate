import * as SparkPost from 'sparkpost';

export const sendForgotPasswordEmail = async (recipient: string, url: string) => {
  try {
    const client = new SparkPost(process.env.SPARKPOST_API_KEY);
    await client.transmissions.send({
      options: {
        sandbox: true,
      },
      content: {
        from: 'testing@sparkpostbox.com',
        subject: 'Forgot Password',
        html:
          `<html>
          <body>
            <p>You recieved this email because someone used forgot password function on this account</p>
            <p>If it was'nt you, just ignore this message, if it was you - please, follow the link below.</p>
            <a href="${url}">Click to Change Password</a>
          </body>
          </html>`,
      },
      recipients: [{ address: recipient }],
    });
    return true;
  } catch (err) {
    return false;
  }
};
