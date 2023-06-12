export default function topLevel(req, res) {
  res.send({ msg: `hello`, params: req.params });
}
