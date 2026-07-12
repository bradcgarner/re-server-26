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
  sendAll            :  'no-reply@bradgarner.com',
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

const sendVPApp = vp => {

	const firstName = vp.contact_name_first || vp.contact_company;
	const link = `${process.env.VP_APP_URL}${vp.vp_temp_id}`;

	const mailOptions = {
    from:    addr.sendAll,
    to:      ['outinsidethebeltway@hotmail.com'],//[vp.contact_email],
    cc:      addr.receiveAll,
    subject: 'Vendor Partner Intake Form',
    html:    `<p>Hi ${firstName}, Thanks so much for your interest in our Vendor Partner Program! The steps are simple.</p>
		<p>1. Please complete the form at <a href="${link}">${link}</a>. The form will ask you for names and phone numbers of three of your past clients for references.</p>
		<p>2. We'll call your references, and we will encourage them to leave you an online review at the link you provide.</p>
		<p>3. Whenever we speak with anyone who might be in need of your services, we'll refer you, using your clients' references. As a general rule, we try to refer two partners of each category so that our customers have choices.</p>
		<p>4. We'll check in from time-to-time to see how this is working out for you.</p>
		<p>Thanks again!</p>`,
    text:    `some text`,
  };

	sgMail.send(mailOptions)
		.then(()=>{
			console.log('sent');
		})
		.catch(error =>{
      console.error(`Error sending email to: ${mailOptions.to}`, error); 
    });
	return;
};


module.exports = {
  sendPwReset,
	sendVPApp,
};