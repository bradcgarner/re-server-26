'use strict';

const { 
  convertTimestampToString,
  isPrimitiveNumber,
  isObjectLiteral      } = require('conjunction-junction'); 
const generator          = require('generate-password');
const sgMail             = require('@sendgrid/mail');

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const throwMode = process.env.THROW_MODE === 'console';
sgMail.setApiKey(SENDGRID_API_KEY);

const addr = {
  receiveAll         : ['brad@bradgarner.com'],
  sendAll            :  'brad@bradgarner.com',
};

const signature = `<br/>
	<p style="font-weight: bold; margin: 0px;">Brad Garner, Realtor</p>
	<p style="margin: 0px;">703.731.4163</p>
	<p style="margin: 0px;">https://www.bradgarner.com</p>
	<p style="margin: 0px;">eXp Realty LLC</p>
	<p style="margin: 0px;">VA Real Estate License # 0225276567</p>
	<br/>
	<p style="margin: 0px;"><span style="font-weight: bold;">Know someone thinking about moving? </span> Feel free to connect me — I'm happy to help.</p>
	<p style="margin: 0px;"><span style="font-weight: bold;">Not local? No problem. </span> I can help with real estate or trusted business recommendations anywhere in the U.S. & Canada.</p>
	<p style="margin: 0px;"><span style="font-weight: bold;">Need or recommend a great local business? </span> I keep a vetted list and am always happy to add great people to it,</p>`;

const sendPwReset = (user, tempPw) => {
  const recipient = user.email ;
  const mailOptions = {
    from:    addr.sendAll,
    to:      [recipient],
    bcc:      addr.receiveAll,
    subject: 'Password Reset',
    text:    `Your XXXXXXXX password has been temporarily reset to ${tempPw} and your username is ${user.username}.`,
    html:    `<p>Your <strong>XXXXXXX</strong> password has been temporarily reset to:</p>
    <p><strong style="color:red; font-size:18px;">${tempPw}</strong></p>
    <p>Your username is <strong>${user.username}</strong>.</p>`,
  };

  sgMail.send(mailOptions)
    .then(()=>{
      console.log(`pw reset email successfully sent to ${recipient}.`);
    })
    .catch(error =>{
      console.error(`Error sending pw reset email to: ${recipient}`, error); 
    });
  return;
};

const sendVPApp = vp => {

	const firstName = vp.contact_name_first || vp.contact_company;
	const link = `${process.env.VP_APP_URL}${vp.vp_temp_id}`;

	const mailOptions = {
    from:    addr.sendAll,
    to:      ['outinsidethebeltway@hotmail.com'],//[vp.contact_email],
    bcc:      addr.receiveAll,
    subject: 'Vendor Partner Intake Form',
    html:    `<p style="font-weight: bold;">Hi ${firstName}, Thanks so much for your interest in our Vendor Partner Program!</p>
		<p>This is a no-cost referral program. We maintain a list of 5-star vendors. The list is 100% word-of-mouth and 100% vetted with references, so that I can assure my clients superior referrals for all their needs.</p>
		<p style="font-style: italic;">The steps are simple.</p>
		<ol>
		<li>Complete the form at <a href="${link}">${link}</a>. The form will ask you for names and phone numbers of 3 past clients for references.</p>
		<li>We'll call your references. We will encourage them to leave you a GREAT online review at the link you provide.</p>
		<li>Whenever we speak with anyone who might be in need of your services, we'll refer you, using your clients' references. As a general rule, we refer 2 partners of each category so that our customers have choices.</p>
		<li>We'll check in from time-to-time to see how this is working out for you.</p>
		</ol>
		<p style="font-weight: bold;">Thanks again!</p>
		<p> </p>
		${signature}`,

		text:    `Hi ${firstName}, Thanks so much for your interest in our Vendor Partner Program!
		This is a no-cost referral program. We maintain a list of 5-star vendors. The list is 100% word-of-mouth and 100% vetted with references, so that I can assure my clients superior referrals for all their needs.
		The steps are simple.
		1. Complete the form at ${link}. The form will ask you for names and phone numbers of 3 past clients for references.
		2. We'll call your references. We will encourage them to leave you a GREAT online review at the link you provide.
		3. Whenever we speak with anyone who might be in need of your services, we'll refer you, using your clients' references. As a general rule, we refer 2 partners of each category so that our customers have choices.
		4.We'll check in from time-to-time to see how this is working out for you.
		Thanks again!
		Brad Garner, Realtor
		703.731.4163
		https://www.bradgarner.com
		eXp Realty LLC
		VA Real Estate License # 0225276567
		Know someone thinking about moving? Feel free to connect me — I'm happy to help.
		Not local? No problem. I can help with real estate or trusted business recommendations anywhere in the U.S. & Canada.
		Need or recommend a great local business? I keep a vetted list and am always happy to add great people to it.
		`,
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

const notifyOfSubmission = vp => {
	const firstName = vp.vp_name_business || 'Partner';
	const link = `${process.env.VP_APP_URL}${vp.vp_temp_id}`;

	const mailOptions = {
    from:    addr.sendAll,
    to:      [vp.vp_email],
    cc:      addr.receiveAll,
    subject: 'RECEIVED Vendor Partner Intake Form',
    html:    `<p style="font-weight: bold;">Hi ${firstName}, Thank you for completing and returning the Vendor Partner Intake Form. This email confirms our receipt.</p>
		<p>Until we review and accept the form, it remains editable at <a href="${link}">${link}</a> (just in case you need to change anything).</p>
		<p style="font-weight: bold;">Thanks again! We'll be in touch soon.</p>
		<p> </p>
		${signature}`,
		text:    ` `,
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

const notifyOfCompletion = e => {

	let html = `
		<p style="margin: 0px;">${`${e.sal} ${e.name}`},</p>
		<br/>
		<p style="margin: 0px;">${e.message}</p>
		<br/>
		<div style="margin-bottom: 10px; border-bottom: 1px solid black;">
			<br/>
		</div>

		<p style="margin: 0px; font-weight: bold;">${e.co}</p>
		<p style="margin: 0px;">${e.cat}</p>
		<p style="margin: 0px;">${e.area}</p>
		<p style="margin: 0px;">${e.poc}</p>
		<p style="margin: 0px;">${e.ph}</p>
		<p style="margin: 0px;">${e.em}</p>
		<p style="margin: 0px;">${e.addr}</p>
		<p style="margin: 0px;">${e.url || 'no website'}</p>

		<p>REFERENCES FOR ${e.co.toUpperCase()}:</p>		
		`;
	if(Array.isArray(e.vp_refs)){
		e.vp_refs.forEach(x=>{
			html += `<div style="padding-bottom: 10px; margin-bottom: 10px;">
				<p style="margin: 0px;">${x.rev}</p>
				<p style="margin: 0px; font-style: italic;">- ${x.by}</p>
			</div>
			<br/>
			`;
		});
	}
	html += `<p style="margin: 0px;">${e.rev} <a href=${e.revUrl} target="_blank">${e.revUrl}</a>.</p>
	<br/>
	<div style="margin-bottom: 10px; border-bottom: 1px solid black;">
		<br/>
	</div>
	<p style="margin: 0px;">${e.note}</p>
	${signature}`;
						
	const mailOptions = {
		from:    addr.sendAll,
		to:      e.em,
		bcc:      addr.receiveAll,
		subject: 'Vendor Partner Application Complete and Active',
		html,
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

const sendReferrals = referrals => {
	const emails = [];
	referrals.forEach(r=>{
		let html = `
		<p style="margin: 0px;">${`${r.sal} ${r.names}`},</p>
		<br/>
		<p style="margin: 0px;">${r.message}</p>
		<br/>

		<p style="margin: 0px; font-weight: bold;">${r.name}</p>
		<p style="margin: 0px;">${r.email || ''}</p>
		<p style="margin: 0px;">${r.phone || ''}</p>
		<br/>
		`;
						
		if(Array.isArray(r.vps)){
			r.vps.forEach(f=>{
				html += `<div>
					<p style="margin: 0px; font-weight: bold;">${f.co}</p>
					<p style="margin: 0px;">${f.cat}</p>
					<p style="margin: 0px;">${f.area}</p>
					<p style="margin: 0px;">${f.poc}</p>
					<p style="margin: 0px;">${f.ph}</p>
					<p style="margin: 0px;">${f.em}</p>
					<p style="margin: 0px;">${f.addr}</p>
					<p style="margin: 0px;">${f.url || 'no website'}</p>

					<p>REFERENCES FOR ${f.co.toUpperCase()}:</p>
				</div>
				`;
					
					if(Array.isArray(f.vp_refs)){
						f.vp_refs.forEach(x=>{
							html += `<div style="padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid black;">
								<p style="margin: 0px;">${x.rev}</p>
								<p style="margin: 0px; font-style: italic;">- ${x.by}</p>
							</div>
							<br/>
							`;
						});
					}
				html += `<p style="margin: 0px;">${f.rev} <a href=${f.revUrl} target="_blank">${f.revUrl}</a>.</p>
				<br/>
				`;
	
			});
			html += `<p style="margin: 0px;">${r.note}</p>
			`;
			html += signature;

		}
		emails.push({
			from:    addr.sendAll,
			to:      r.emails,
			bcc:      addr.receiveAll,
			subject: r.subject,
			html,
		});
	});

	emails.forEach((e,i)=>{
		sgMail.send(e)
			.then(()=>{
				console.log('sent',i);
			})
			.catch(error =>{
				console.error(`Error sending email to: ${e.to}`, error); 
			})
	});
	return;
};

module.exports = {
  sendPwReset,
	sendVPApp,
	notifyOfSubmission,
	notifyOfCompletion,
	sendReferrals,
};