'use strict';

const express               = require('express');
const router                = express.Router();
const bcrypt                = require('bcryptjs');
const generator             = require('generate-password');
const jwt                   = require('jsonwebtoken');
const { isPrimitiveNumber } = require('conjunction-junction');
const logger                = require('log123').createLogger('auth.log');
const { sendPwReset }       = require('./notifications');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRY = process.env.JWT_EXPIRY;

const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

router.use(express.json());

const hashPassword = password => {
  return bcrypt.hash(password, 12);
};

const validatePassword = (suppliedPW, agentPW) => {
  return bcrypt.compare(suppliedPW, agentPW);
};

const createAuthToken = agent => {
  return jwt.sign(
    {agent},      // object to encrypt
    JWT_SECRET,
    {            // object has a fixed format; do not edit (subject can be another string)
      subject: agent.agent_email,
      expiresIn: JWT_EXPIRY,
      algorithm: 'HS256',
      allowInsecureKeySizes: true,
    }
  );
};

const userIsAdmin = userContainer => {
  return userContainer && 
  userContainer.contents &&
  userContainer.contents.agent &&
  Array.isArray(userContainer.contents.agent.agent_permissions) &&
    userContainer.contents.agent.agent_permissions.includes('admin');
};

const getUserPermissions = userContainer => {
  return userContainer && 
  userContainer.contents.agent &&
  userContainer.contents.agent &&
  Array.isArray(userContainer.contents.agent.agent_permissions) ?
    userContainer.contents.agent.agent_permissions :
    [];
};

const routesAllowed = {
  GET: {
    agent: { // most basic agent_permissions
      '//api/general/get-lists': true,
      '//api/general/core-values': true,
			'//api/activities/follow-ups': true,
			'//api/activities//': true,
			'//api/activities/*': true,
			'//api/contacts//': true,
			'//api/contacts/*': true,
			'//api/daily-plans//': true,
			'//api/daily-plans/*': true,
			'//api/deals//': true,
			'//api/deals/*': true,
			'//api/proformae/*': true,
    },
    admin: {
      '//api/users/*': true,
    },
  },
  POST: {
    agent: {

		},
		admin: {

		},
  },
  PUT: {
    agent: {
			'//api/activities': true,
			'//api/contacts': true,
			'//api/daily-plans': true,
			'//api/deals': true,
			'//api/proformae': true,
    },
		admin: {

		},
  },
  DELETE: {
    admin: {

    },
		admin: {

		},
  },
};

// add all urls to admin
for(let method in routesAllowed){
  for(let permission in routesAllowed[method]){
    if(permission !== 'admin'){
      for(let url in routesAllowed[method][permission]){
        if(!routesAllowed[method].admin[url]){
          routesAllowed[method].admin[url] = true;
        }
      }
    }
  }
}

const jwtStrategy = (req, res, next, userContainer={})=>{
  // this is middleware, so don't throw (it won't make it back to the calling function)
  // instead respond on error, and the calling function is never called
  // see next() at the end, which calls the calling function if this passes
  // step 1: check header or url parameters or post parameters for token
  var tokenWithBearer = req.headers.authorization;
	console.log(req.headers)
	console.log({tokenWithBearer})
  if(!tokenWithBearer){
    res.status(403).json({
      message:'No Token'
    });
  } else {
    const token = tokenWithBearer.slice(7,tokenWithBearer.length);
    console.log({token})

    // Decode the token
    jwt.verify(token,JWT_SECRET,(err,decod)=>{
      console.log('err', err, 'decod', decod);

      if(err){
        res.status(403).json({message:'Wrong Token'});
      } else {
        //If decoded then call next() so that respective route is called.
        req.decoded = decod;
        console.log(decod)
        // we must APPEND userContainer
        // trying to replace it does not work
        userContainer.contents = req.decoded;
        if(!Array.isArray(req.decoded.agent.agent_permissions)){
          res.status(403).json({
            message:`Cannot read permissions for ${req.decoded.agent.agent_email}`,
          });
        } else {
          if(req.decoded.exp < req.decoded.iat) {
            res.status(403).json({
              message:'Expired Token'
            });
          } else if(!routesAllowed[req.method]) {
            res.status(403).json({
              message:`Sorry, ${req.method} access not granted to you, ${req.decoded.agent.username}`
            });
          } else {
            const urlOnly = req.originalUrl.split('?')[0];
            const urlArray = urlOnly.split('/');
            const urlArrayAdjusted = urlArray.map(u=>{
              // const iString = `${i}`;
              const asInt = parseInt(u, 10);
              const isNum = isPrimitiveNumber(asInt);
              const segment =
                u === '' ? '/' :
                  isNum && `${asInt}` === `${u}` ? '*' :
                    u;
              return segment;
            });

            const url = urlArrayAdjusted.join('/');
            console.log(url)
            const allowedPermission = userContainer.contents.agent.agent_permissions.find(p=>{
              console.log('p',p, 'routesAllowed[req.method][p]',routesAllowed[req.method][p])
              if(routesAllowed[req.method][p] &&
                routesAllowed[req.method][p][url]){
                return true;
              }
            });
            console.log(allowedPermission)
            if(!allowedPermission) {
              res.status(403).json({
                message:`Sorry, ${req.method} access to ${req.originalUrl} not granted to you, ${req.decoded.agent.username}, agent_permissions: ${userContainer.contents.agent.agent_permissions}`
              });
            } else {
              console.log('ALLOWED', userContainer.contents.agent, req.method, req.originalUrl)
              next();
            }
          } // end if expired / else if no routes found / else check allowedPath
        }   // end if no agent_permissions / else agent_permissions
      }     // end if err / else no err
    });     // end verify token function
  }         // end if no token / else token
};

router.post('/pw-reset', (req, res) => {
  
  let tempPw;
  let hashed;
	let id_agent;

  const agent_email = req.body ? req.body.agent_email : null;
  if(!agent_email || typeof agent_email !== 'string') {
    return res.status(400).json({message: 'invalid email'});
  }
	console.log({agent_email})


  return new Promise(resolve => {
		resolve();
	})
	.then(()=>{
    return supabase
      .from('agents')
      .select(`*`)
      .eq('agent_email',  agent_email.toLowerCase())
  })
  .then( r => { 
		const { data, error } = r;
		console.log({data})
		const agent = Array.isArray(data) ? data[0] : {};
		console.log({agent})
    id_agent = agent.id_agent;

    if(!id_agent){
      throw {message: 'user id not found'};
    }
    tempPw = generator.generate({
      length: 10,
      numbers: true
    });
    return hashPassword(tempPw)
      .then(_hashed=>{
        hashed = _hashed;
        return
      })
    })
    .then(()=>{
      return supabase
        .from('agents')
        .update({
          agent_password: hashed,
          agent_pw_reset: true,
        })
        .eq('id_agent', id_agent)
				.select()
    })
    .then(r => { 
			console.log(r)
			const { data, error } = r;
			console.log({data});
			const agent = Array.isArray(data) ? data[0] : {};
			console.log({agent});
   
      // sendPwReset(agent, tempPw);
      console.log({tempPw})
      const responseObject = {
        error: false,
        message: `We sent the username and temporary password to ${agent.agent_email}. Use those credentials to log in above, then reset your password.`
      };
      res.status(200).json(responseObject);
    })
    .catch( err => {
      console.error(err);
      return res.status(500).json(err);
    });
});

router.post('/login', (req, res) => {

  let authToken, agent;

  const userFromClient = req.body;
  if(!userFromClient.agent_email) {
    // all responses are 200 so that we control the message being sent back
    res.status(200).json({ message: 'missing username' });
    return;
  } else if(!userFromClient.agent_password){
    res.status(200).json({ message: `missing password for ${userFromClient.agent_email}` });
    return;
  } else {
    
		const agent_email = userFromClient.agent_email.toLowerCase();

    return new Promise(resolve => {
		  resolve();
	  })
	  .then(()=>{
      return supabase
        .from('agents')
        .select('*')
        .eq('agent_email', agent_email)
    })
    .then(r => {
			console.log(r)
			const { data, error } = r;
			console.log({data});
			agent = Array.isArray(data) ? data[0] : {};
			console.log({agent});
      return validatePassword(userFromClient.agent_password, agent.agent_password);
    })
    .then( isValid => {
			console.log({isValid})
      if(!agent){
        return; // already responded
      }
      if(!isValid) {
        return res.status(200).json({ message: `incorrect password for ${userFromClient.agent_email}` });
      } else {
        const agentForToken = {
          id_agent:          agent.id_agent,
          agent_email:       agent.agent_email,
          agent_permissions: agent.agent_permissions,
        };
        authToken = createAuthToken(agentForToken);
        const userForResponse = {
          id_agent:          agent.id_agent,
          agent_email:       agent.agent_email,
          agent_name_first:  agent.agent_name_first,
          agent_name_last:   agent.agent_name_last,
          authToken:         authToken,
          pw_reset:          agent.pw_reset,
          agent_permissions: agent.agent_permissions,
        };
        return res.status(200).json(userForResponse);
      }
      })
      .catch(err => {
        console.error(err);
        return res.status(500).json(err);
      });
  }
});

router.post('/relogin', (req, res) => {
  
  const authToken = req.body.authToken;
  let id_agent;
	let agent;

  if(!authToken){
    logger.info('user has no token');
    return res.status(400).json({message: 'missing auth token, cannot reauthenticate; please log in with username and password'});
  }
  return new Promise(resolve=>{
    resolve(
      jwt.verify(authToken,JWT_SECRET,(err,decod)=>{
				console.log({decod});
        if(!err && decod.agent && isPrimitiveNumber(decod.agent.id_agent)){
          id_agent = decod.agent.id_agent;
        }
      })
    );
  })
  .then(()=>{
    if(!id_agent){
      throw {message: 'user id not found'};
    }
    return supabase
      .from('agents')
      .select('*')
      .eq('id_agent', id_agent)
    })
    .then(r => {
			console.log(r)
			const { data, error } = r;
			console.log({data});
			agent = Array.isArray(data) ? data[0] : {};
			console.log({agent});

      if(!agent){
        throw {message: 'user not found'};
      }
      const agentForToken = {
        id_agent:          agent.id_agent,
        agent_email:       agent.agent_email,
        agent_permissions: agent.agent_permissions,
      };
      const newAuthToken = createAuthToken(agentForToken);
      const userForResponse = {
        id_agent:          agent.id_agent,
        agent_email:       agent.agent_email,
        agent_name_first:  agent.agent_name_first,
        agent_name_last:   agent.agent_name_last,
        authToken:         newAuthToken,
        agent_permissions: agent.agent_permissions,
      };
      // logger.info('userForResponse',userForResponse);
      return userForResponse;
    })
    .then(agent => {
      // logger.info('agent',agent);
      return res.status(200).json(agent);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json(err);
    });
});



module.exports = {
  router, 
  jwtStrategy, 
  hashPassword,
  createAuthToken,
  userIsAdmin,
  getUserPermissions,
};