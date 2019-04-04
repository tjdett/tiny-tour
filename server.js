const express = require('express'),
  morgan = require('morgan'),
  PouchDB = require('pouchdb-node'),
  createDOMPurify = require('dompurify'),
  { JSDOM } = require('jsdom'),
  open = require('open');
  DOMPurify = createDOMPurify((new JSDOM('')).window);

PouchDB.plugin(require('pouchdb-find'));

function App(data) {
  const app = express();
  app.use(morgan('tiny'));
  app.use(express.json());

  // Static client setup
  ['demo', 'node_modules', 'dist'].forEach(
    (dir) => app.use('/' + dir, express.static(dir))
  );

  // Redirect the root path to the client side app
  app.get('/', (_, req) => req.redirect('/demo/welcome.html'));

  // Sanitize the input content for security purposes to guard against
  // things like script injection
  const makeSafe = ({ title, content: unsafeContent }) => ({
    title,
    content: DOMPurify.sanitize(unsafeContent)
  });

  const errHandler = (res) => (err) => {
    console.log(err);
    res.status(err.status).send(err.message)
  };


  // RESTful endpoint to get all articles
  app.get('/articles', (req, res) =>
    data.list(req.params.limit, req.params.before)
      .then((obj) => res.json(obj))
      .catch(errHandler(res))
  );

  // RESTful endpoint to create a new article
  app.post('/articles', (req, res) =>
    data.create(makeSafe(req.body))
      .then((obj) => res.status(201).location('/articles/' + obj.id).json(obj))
      .catch(errHandler(res))
  );

  // RESTful endpoint to get a single article
  app.get('/articles/:id', (req, res) =>
    data.get(req.params.id)
      .then((obj) => res.json(obj))
      .catch(errHandler(res))
  );

  // RESTful endpoint to update an article
  app.put('/articles/:id', (req, res) =>
    data.update({ id: req.params.id, ...makeSafe(req.body) })
      .then((obj) => res.json(obj))
      .catch(errHandler(res))
  );

  // RESTful endpoint to delete an article
  app.delete('/articles/:id', (req, res) =>
    data.remove(req.params.id)
      .then(() => res.status(204).send())
      .catch(errHandler(res))
  );

  return app
}

function Data(db) {

  const toArticle = ({ _id: id, title, content, created }) => {
    return { id, title, content, created }
  };

  // Load a record from the pouch DB database
  const get = (id) => db.get(id).then(toArticle);

  // Create a new record in the database
  const create = ({ title, content }) =>
    db.post({ title, content, created: new Date().toJSON() })
      .then(({ id }) => get(id));

  // Update an existing record in the database
  const update = ({ id: _id, title, content }) =>
    db.get(_id)
      .then(({ _rev, created }) =>
        db.put({ _id, _rev, title, content, created })
      )
      .then(({ id }) => get(id));

  // Delete a record from the database
  const remove = (id) => db.get(id).then(({ _rev }) => db.remove(id, _rev));

  // Get a list of records in the database
  const list = (limit = 10, before = null) =>
    db.createIndex({
      index: {
        fields: ['created']
      }
    }).then(() => db.find({
      selector: { created: before ? { $lt: before } : { $gt: null } },
      limit,
      sort: [{ created: 'desc' }]
    })).then(({ docs }) => { return { articles: docs.map(toArticle) } });

  return {
    create,
    update,
    get,
    list,
    remove
  }
}

// Start the server
const app = App(Data(PouchDB('db')));
port = 3000;
app.listen(port, () => console.log(`App listening on port ${port}!`));

// Open the browser page if requested
if (process.argv.indexOf('--open') !== -1) {
  open('http://localhost:3000');
}