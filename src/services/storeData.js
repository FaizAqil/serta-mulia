const { Firestore } = require('@google-cloud/firestore');
 
async function storeData(id, data) {
  const db = new Firestore();
  console.log('Connected to Firestore');

  const predictCollection = db.collection('prediction');
  try {
      await predictCollection.doc(id).set(data);
      console.log('Data stored successfully');
  } catch (error) {
      console.error('Error storing data:', error);
  }
}
 
module.exports = storeData;