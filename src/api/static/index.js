module.exports = (req, res) => {
  res.send({ msg: `hello`, params: req.params });
};
