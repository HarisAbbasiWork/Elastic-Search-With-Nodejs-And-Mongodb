var express = require('express');
var router = express.Router();
var postController = require('../controllers/postController.js');
var jwt = require('jsonwebtoken');
function extractToken(req) {
  console.log("req.headers.authorization ", req.headers.authorization)
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    return req.query.token;
  }
  return null;
}
const verifyToken = async (req, res, next) => {
  const token = await extractToken(req)
  console.log("token", token)
  if (!token) {
    return res.status(401).send("Yo, we need a token")
    next()
  } else {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log("Token Expired")
        return res.status(401).json({ auth: false, message: "Token Expired" })
        next()
      } else {
        console.log("decoded ", decoded)
        req.userId = decoded.id;
        console.log("User Authenticated", decoded.id)
        next()
      }
    })
  }
}

router.post('/',verifyToken, postController.createPost)
router.get('/', verifyToken, postController.getPosts)
router.get('/search/:query/:pageNo', verifyToken, postController.searchPosts)
router.get('/filterpostsbydate/:startDate/:endDate', verifyToken, postController.filterPostsByDate)
router.get('/:id', verifyToken, postController.getPostById)
router.delete('/:id', verifyToken, postController.deletePostById)
module.exports = router;