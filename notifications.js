'use strict';

const { 
  convertTimestampToString,
  isPrimitiveNumber,
  isObjectLiteral      } = require('conjunction-junction'); 
const generator          = require('generate-password');
const sgMail             = require('@sendgrid/mail');
const logger             = require('log123').createLogger('notifications.log');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const throwMode = process.env.THROW_MODE === 'console';
sgMail.setApiKey(SENDGRID_API_KEY);

const addr = {
  receiveAll         : ['brad@bradgarner.com'],
  sendAll            :  'server@bradgarner.com',
};



const sendPwReset = (user, tempPw) => {
  const recipient = user.email ;
  const mailOptions = {
    from:    addr.sendAll,
    to:      [recipient],
    cc:      addr.receiveAll,
    subject: 'Password Reset',
    text:    `Your XXXXXXXX password has been temporarily reset to ${tempPw} and your username is ${user.username}.`,
    html:    `<p>Your <strong>XXXXXXX</strong> password has been temporarily reset to:</p>
    <p><strong style="color:red; font-size:18px;">${tempPw}</strong></p>
    <p>Your username is <strong>${user.username}</strong>.</p>`,
  };

  sgMail.send(mailOptions)
    .then(()=>{
      logger.info(`pw reset email successfully sent to ${recipient}.`);
    })
    .catch(error =>{
      logger.error(`Error sending pw reset email to: ${recipient}`, error); 
    });
  return;
};


module.exports = {
  sendPwReset,
};