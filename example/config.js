exports.solrConfig = {
  url: "http://localhost:8983/solr/collection1"
  field_map: {
    'id': 'url',
    'content': 'body',
    'title': 'title',
    'author': 'author',
    'last_modified': 'last_modified',
    'data_source': 'data_source',
    'index_timestamp': 'index_timestamp',
}
