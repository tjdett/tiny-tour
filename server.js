const express = require('express'),
  morgan = require('morgan'),
  PouchDB = require('pouchdb-node'),
  createDOMPurify = require('dompurify'),
  { JSDOM } = require('jsdom'),
  DOMPurify = createDOMPurify((new JSDOM('')).window)

PouchDB.plugin(require('pouchdb-find'))

function App(data) {
  const app = express()
  app.use(morgan('tiny'))
  app.use(express.json());

  // Static client setup
  ['demo', 'node_modules', 'src'].forEach(
    (dir) => app.use('/' + dir, express.static(dir))
  )
  app.get('/', (_, req) => req.redirect('/demo/demo.html'))

  const makeSafe = ({ title, content: unsafeContent }) => ({
    title,
    content: DOMPurify.sanitize(unsafeContent)
  })

  const errHandler = (res) => (err) => {
    console.log(err)
    res.status(err.status).send(err.message)
  }


  app.get('/articles', (req, res) =>
    data.list(req.params.limit, req.params.before)
      .then((obj) => res.json(obj))
      .catch(errHandler(res))
  )

  app.post('/articles', (req, res) =>
    data.create(makeSafe(req.body))
      .then((obj) => res.status(201).location('/articles/' + obj.id).json(obj))
      .catch(errHandler(res))
  )

  app.get('/articles/:id', (req, res) =>
    data.get(req.params.id)
      .then((obj) => res.json(obj))
      .catch(errHandler(res))
  )

  app.put('/articles/:id', (req, res) =>
    data.update({ id: req.params.id, ...makeSafe(req.body) })
      .then((obj) => res.json(obj))
      .catch(errHandler(res))
  )

  app.delete('/articles/:id', (req, res) =>
    data.remove(req.params.id)
      .then(() => res.status(204).send())
      .catch(errHandler(res))
  )

  return app
}

function Data(db) {

  const toArticle = ({ _id: id, title, content, created }) => {
    return { id, title, content, created }
  }
  const get = (id) => db.get(id).then(toArticle)
  const create = ({ title, content }) =>
    db.post({ title, content, created: new Date().toJSON() })
      .then(({ id }) => get(id))
  const update = ({ id: _id, title, content }) =>
    db.get(_id)
      .then(({ _rev, created }) =>
        db.put({ _id, _rev, title, content, created })
      )
      .then(({ id }) => get(id))
  const remove = (id) => db.get(id).then(({ _rev }) => db.remove(id, _rev))
  const list = (limit = 10, before = null) =>
    db.createIndex({
      index: {
        fields: ['created']
      }
    }).then(() => db.find({
      selector: { created: before ? { $lt: before } : { $gt: null } },
      limit,
      sort: [{ created: 'desc' }]
    })).then(({ docs }) => { return { articles: docs.map(toArticle) } })

  return {
    create,
    update,
    get,
    list,
    remove
  }
}

const app = App(Data(PouchDB('db')))
port = 3000
app.listen(port, () => console.log(`App listening on port ${port}!`))