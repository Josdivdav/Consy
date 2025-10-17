const express = require('express');
const app = express();
const admin = require('firebase-admin');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();
const jwtSecretKey = process.env.JWT_KEY;

const serviceAccount = {
  type: "service_account",
  project_id: "consyacad",
  private_key_id: "f7f3cb73453ea1809f64c3389213057517e9eddf",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDBMW5PIxQa9fHd\nBDva588w6+nU+5eCqHC8m1aYi51cBt5TPJI4vwHLz/31ze8AEtvmDWnrHH/LVtKa\noFYGiPUU7gHz97sMdn1gXFyjNo3UnW+DzxSjjNIgzXYcsS9K0hhkwwHoeabuTorF\nuthyIIlkvnpf6eUBoGsCyKdCq5SqBV2ck09vH8q393FsFULG5B2WtalUU3o4DvKq\ngi6JAlt6HqlzVY5XO+kD610LFgAcDsv6One9yNLXzWdoqmM0A6wzAABLEOwZ2hQD\nS9eZy/LEwu95fgm6HWwSYwj+Q7n4jHHawiyN9GYxDz9S8USx6qN6CPOL8yv6yLwT\n8MuvxcsZAgMBAAECggEAF4keFyX+3Qn5XSOW5yQ2aY9T/U5pNtGuakvCUPMxSHTN\nwPYwGhmq7ll4ZumfpDKn927K6ImgR/Vb0tqVoFYvBU25jy8u6mXFAGhAIOIUhUJo\nw3YG3aXaM4TUTsqHKGZP8naPVPL9EyseXNhWZhDwrAVIg0bLT1drsfsf5U9h3RRz\nj4hVJiBl3otIkdGL1uxUX1sFWCl+1IM3EQlJ7WXcqqBPbDOKk377kr3cz/5XTrvs\n1N4mN6qh1t70EFh8OjaRLerGQZNyNwTfxa/qWlk5M9j7nZCWVmA6OPML0Oe7p3t+\n5y+DImo/Izq6Vh2ooMgPlAj6LxTZ6198BRhSPxQVwQKBgQD/QDLV+hF6Kq7gPrRz\n1lT85XHmlTxZoEKk75P2N8jvLw2aNVK8ljZyLHbcP7JRNjC8VFrz0Aguor833zp2\nt7kuRm8/CYfzeYe2zxH0FC//m/U1CgXRU5nbpxqdN+Dzhiyghwd+Nyu3VDisQR/Y\nVoQSnU0glb0qbrrwSO+Z4CWRpwKBgQDBwpnIgz4nizHED0xcxr32wz10JsJA+jvF\npFiT7z47Bu5dVYPidUzOADHS8ojmZgUxe3Pv/aEKw6a3guDmPiAO93f+76ceQS9C\ns3dzWmZ7NIh8qZA1GVl6EJCa2L2w7MIdK0A/+gKa74D6KSkw5WHv5bGe40KLB+eY\nV/KYLdHVPwKBgQDKvtuiSzeGqlCtniEHwb9QAZAvb2q4ZiuJhyMn97eLBPzw+Fn3\nofktR1RCLfYdu8WKUhbMgvl80ZjBcHanxdc5gojqsU9jfazm8CN6lG5rwh1LO+LT\nGmyjpF/ncXMk+/aGq7qv7nKy9Brv9+qrlEzj3D5fG5FeGwYxxj1LJFezEQKBgQC8\nbfmMDEZHwpA1MQN8PjLDZX/AE2laM4ApZvhVdZa5ZLYuwlktxBFbTMkncoI8Pf7S\n7lIDlE4m37qkQH1irAwVQgjKPlnxjEbfwRRrdACx1JbfVS9O1EY19SIL1Lg09SqZ\nn1QuY35hGoX9wkWyrYCfAmvILw6pkphhiTX9VKH5lQKBgQDNM0SVshYHqIETzPkK\nEIGzD9XagLtCZrLnQhdWhRBX7MiZ69mKkvfYajJxfbpnbYHD7tqB4DNYG3NU0tye\n+UtNUCeiNFusu06bWiMZ1vTDXNHzPNJQ4Sl8depKCwh5kUzKXcPZCuIHkCdxZPDy\neYZyuZgTT/0ovf80VwzePg/hqw==\n-----END PRIVATE KEY-----\n",
  client_email: "firebase-adminsdk-fbsvc@consyacad.iam.gserviceaccount.com",
  client_id: "112790672913516555585",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40consyacad.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://consyacad.firebaseio.com"
});

app.use(express.json());

const db = admin.firestore();
app.post("/api/register", async (req, res) => {
  const { email, password, username, courses, timestamp, accountType, department } = req.body;
  try {
    const id = await db.collection('users').where('email', '==', email).get();
    if (!id.empty) {
      return res.status(400).send({ status: 'error', error: 'Email already registered' });
    }
    const uid = db.collection('users').doc().id;
    await db.collection('users').doc(uid).set({
      email,password,username,courses, createdAt: timestamp,uid,department, accountType
    });
    res.status(200).send({ status: 'success' });
  } catch (error) {
    res.status(500).send({ status: 'error', error: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userSnapshot = await db.collection('users').where('email', '==', email).where('password', '==', password).get();
    if (userSnapshot.empty) {
      return res.status(400).send({ status: 'error', error: 'Invalid email or password' });
    }
    const userData = userSnapshot.docs[0].data();
    const token = jwt.sign({ uid: userData.uid, email: userData.email }, jwtSecretKey);
    res.status(200).send({ status: 'success', token, user: userData });
  }
  catch (error) {
    res.status(500).send({ status: 'error', error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});