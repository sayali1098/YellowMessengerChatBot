'use strict';
 
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

admin.initializeApp({
credential: admin.credential.applicationDefault(),
databaseURL: 'ws://yoyobot--fhuc.firebaseio.com/'
});
 
process.env.DEBUG = 'dialogflow:debug'; 
 
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  function welcome(agent) {
    agent.add(`Welcome to my agent!`);
  }
 
  function fallback(agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
  }
  
  function myorder(agent) 
  {
    const type = agent.parameters.type;
    const menu = agent.parameters.menu;
    const size = agent.parameters.size;
    const toppings = agent.parameters.toppings;
    const oid = Math.floor((Math.random() * 9999) + 1000);
    const name = agent.parameters.name;
    const phone = agent.parameters.phone;
    const address = agent.parameters.address;
    agent.add(`Kudos!! Your order has been placed ${name} Don't forget to save your order id ${oid} for tracking your order. You can track your order by entering "my order"`);
    
    return admin.database().ref('data').set({
          type: type,
          menu: menu,
          size: size,
          toppings: toppings,
          order_id: oid,
          user: name,
          phone: phone,
          location: address
      });
  }

  function mystatus(agent){
    const orderid = agent.parameters.id;
    return admin.database().ref('data').once('value').then((snapshot)=>{
    const Order_id = snapshot.child('order_id').val();
    const my_pizza = snapshot.child('menu').val();
    const type = snapshot.child('type').val();
    const customer = snapshot.child('user').val();
    if(Order_id == orderid){
      agent.add(`Hey ${customer}, Your order is on it's way! Your ${type} ${my_pizza} will be delieverd soon!!`);
    }
      else
        agent.add(`Oops! Seems you've entered an invalid id. Please try again!`);
});

}

  let intentMap = new Map();
  intentMap.set('Default Welcome Intent', welcome);
  intentMap.set('Default Fallback Intent', fallback);
  intentMap.set('user-info', myorder);
  intentMap.set('status', mystatus);
  agent.handleRequest(intentMap);
});
