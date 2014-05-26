「７つのデータベース７つの世界」勉強会03 

第2章PostgreSQL2日目

SELECT venue_id, count(*) FROM events GROUP BY venue_id ORDER BY venue_id IS NULL DESC;


order by に "IS NULL" とか "IS NOT NULL"も使える


book=# SELECT venue_id, count(*) FROM events GROUP BY venue_id ORDER BY venue_id IS NOT NULL;
 venue_id | count 
----------+-------
          |     3
        2 |     2
        1 |     1
        4 |     1
(4 rows)

book=# SELECT venue_id, count(*) FROM events GROUP BY venue_id ORDER BY venue_id IS NULL;
 venue_id | count 
----------+-------
        2 |     2
        1 |     1
        4 |     1
          |     3
(4 rows)

book=# SELECT venue_id, count(*) FROM events GROUP BY venue_id ORDER BY venue_id IS NULL DESC;
 venue_id | count 
----------+-------
          |     3
        2 |     2
        1 |     1
        4 |     1
(4 rows)

book=# SELECT venue_id, count(*) FROM events GROUP BY venue_id ORDER BY venue_id IS NOT NULL DESC;
 venue_id | count 
----------+-------
        2 |     2
        1 |     1
        4 |     1
          |     3
(4 rows)



SELECT title, venue_id, count(*)
FROM events
GROUP BY venue_id;


SELECT title, count(*) OVER (PARTITION BY venue_id) FROM events;

SELECT *FROM events;

SELECT title, venue_id, count(*) OVER (PARTITION BY venue_id) FROM events;




BEGIN TRANSACTION;
  DELETE FROM events;
SELECT * FROM events;
ROLLBACK;
SELECT * FROM events;





--- code/postgres/add_event.sql

CREATE OR REPLACE FUNCTION add_event( title text, starts timestamp,
  ends timestamp, venue text, postal varchar(9), country char(2) )
RETURNS boolean AS $$
DECLARE
  did_insert boolean := false;
  found_count integer;
  the_venue_id integer;
BEGIN
  SELECT venue_id INTO the_venue_id
  FROM venues v
  WHERE v.postal_code=postal AND v.country_code=country AND v.name ILIKE venue
  LIMIT 1;

  IF the_venue_id IS NULL THEN
    INSERT INTO venues (name, postal_code, country_code)
    VALUES (venue, postal, country)
    RETURNING venue_id INTO the_venue_id;

    did_insert := true;
  END IF;

  -- Note: not an “error”, as in some programming languages
  RAISE NOTICE 'Venue found %', the_venue_id;

  INSERT INTO events (title, starts, ends, venue_id)
  VALUES (title, starts, ends, the_venue_id);

  RETURN did_insert;
END;
$$ LANGUAGE plpgsql;



  -- Note: not an "error", as in some in some programming languages
BEGIN
  RAISE NOTICE 'Venue found %', the_venue_id;
END;

  INSERT INTO events (title, starts, ends, venue_id)
  VALUES (title, starts, ends, the_venue_id);

  RETURN did_insert;
END;
$$ LANGUAGE plpgsql;







SELECT name, to_char(date, 'Month DD, YYYY') AS date
FROM holidays
WHERE date <= '2012-04-01';


ALTER TABLE events
ADD colors text ARRAY;


UPDATE holidays SET colors = '{"red","green"}' where name = 'Christmas Day';



CREATE TEMPORARY TABLE month_count (month INT);
INSERT INTO month_count VALUES (1), (2), (3), (4), (5), (6), (7), (8), (9), (10), (11), (12);




CREATE TEMPORARY TABLE days_of_week (d INT);
INSERT INTO days_of_week VALUES (0), (1), (2), (3), (4), (5), (6);


SELECT * FROM crosstab(
  'SELECT extract(week from starts) as w, extract(dow from starts) as d, count(*) FROM events GROUP BY w, d ORDER BY w',
	'SELECT * FROM days_of_week'
) AS (
  w int,
  sun int, mon int, tue int, wed int, thu int, fri int, sat int
);
