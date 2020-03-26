const nodemailer = require('nodemailer');
const request = require('./request');

const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';

const SUPPORTED_EMAIL_CLIENTS = {
  sendgrid: 'sendgrid',
  mailcatcher: 'mailcatcher',
};

const postToSengrid = ({
  params, subject, to, from, templateId,
}) => {
  const body = {
    personalizations: [{
      to,
      dynamic_template_data: {
        ...params,
        subject,
      },
    }],
    from,
    subject,
    reply_to: from,
    template_id: templateId,
  };
  return request.post({
    uri: SENDGRID_API_URL,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
    },
    body,
  });
};

const address = ({ name, email }) => `"${name}" <${email}>`;

const postToMailCatcher = ({
  from, to, subject, params, html,
}) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER_NAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  const paramsHtml = `
    This is an email without the actual template, actual email will be sent with these parameters: <br />
    ${Object.keys(params).map((key) => `<b>${key}</b>: ${params[key]}`).join('<br />')}
  `;
  transporter.sendMail({
    from: address(from),
    to: to.map(address),
    subject,
    html: html || paramsHtml,
  });
};
/**
 * Send Mail
 * @param {Object} args
 * From: {
 *   email: String, name: String
 * }
 * To: [{
 *   email: String, name: String
 * }],
 * params: [key: value]
 * subject: String
 */
const sendMail = (args) => {
  switch (process.env.EMAIL_CLIENT) {
    case SUPPORTED_EMAIL_CLIENTS.sendgrid:
      return postToSengrid(args);
    case SUPPORTED_EMAIL_CLIENTS.mailcatcher:
      return postToMailCatcher(args);
    default:
      throw new Error(`Unsupported email client: ${process.env.EMAIL_CLIENT}`);
  }
};

module.exports = {
  sendMail,
};
