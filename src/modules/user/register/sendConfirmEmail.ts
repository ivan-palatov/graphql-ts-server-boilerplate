import * as SparkPost from 'sparkpost';

export const sendConfirmEmail = async (recipient: string, url: string) => {
  try {
    const client = new SparkPost(process.env.SPARKPOST_API_KEY);
    await client.transmissions.send({
      options: {
        sandbox: true,
      },
      content: {
        from: 'testing@sparkpostbox.com',
        subject: 'Hello, World!',
        html:
          `<html>
          <body>
            <p>Testing SparkPost - the world's most awesomest email service!</p>
            <a href="${url}">Click to Confirm Email</a>
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
