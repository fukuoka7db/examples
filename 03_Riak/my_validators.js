function good_score(object) {
  try {
    /* from the Riak object, pull data and parse it as JSON */
    var data = JSON.parse( object.values[0].data );
    /* if score is not found, fail here */
    if( !data.score || data.score === '' ) {
      throw( 'Score is required' );
    }
    /* if score is not within range, fail here */
    if( data.score < 1 || data.score > 4 ) {
      throw( 'Score must be from 1 to 4' );
    }
  } catch( message ) {
    /* Riak expects the following JSON if a failure occurs */
    return { "fail" : message };
  }
  /* No problems found, so continue */
  return object;
}
