# 「7つのデータベース７つの世界」勉強会 第２回

original
https://code.stypi.com/akimatter/fukuoka7db02.md

### p.13

CREATE TABLE countries (
  country_code char(2) PRIMARY KEY,
  country_name text UNIQUE
);

INSERT INTO countries (country_code, country_name) 
VALUES ('us', 'Unitted States'), ('mx', 'Mexico'), ('au', 'Australia'),
   ('gb', 'United Kingdom'), ('de', 'Germany'), ('ll', 'Loompaland');



INSERT INTO countries
VALUES ('uk', 'United Kingdom');

SELECT * FROM countries;

### p.14

DELETE FROM countries
	WHERE country_code = 'll';

CREATE TABLE cities (
	name text NOT NULL,
	postal_code varchar(9) CHECK (postal_code <> ''),
	country_code char(2) REFERENCES countries,
    PRIMARY KEY (country_code, postal_code)
);

INSERT INTO cities
VALUES ('Toronto', 'M4C1B5', 'ca');

### p.15

INSERT INTO cities
VALUES ('Portland', '87200', 'us');

UPDATE cities
SET postal_code = '97205'
WHERE name = 'Portland';

SELECT cities.*, country_name
FROM cities INNER JOIN countries
  ON cities.country_code = countries.country_code;

### p.16

CREATE TABLE venues (
	venue_id SERIAL PRIMARY KEY,
	name varchar(255),
	street_address text,
	type char(7) CHECK ( type in ('public', 'privat') ) DEFAULT 'public',
	postal_code varchar(9),
	country_code char(2),
	FOREIGN KEY (country_code, postal_code)
		REFERENCES cities (country_code, postal_code) MATCH FULL
);

---

CREATE TABLE chartest01  (
  c char(3)
);

INSERT INTO chartest01 VALUES ('1');
book=# SELECT * FROM chartest01;
  c  
-----
 1  
(1 row)
---

INSERT INTO venues (name, postal_code, country_code) VALUES ('Crystal Ballroom', '97205', 'us');

SELECT v.venue_id, v.name, c.name FROM venues v INNER JOIN cities c
ON v.postal_code=c.postal_code AND v.country_code=c.country_code;

INSERT INTO venues (name, postal_code, country_code)
VALUES ('Voodoo Donuts', '97205', 'us') RETURNING venue_id;


DELETE FROM countries WHERE country_code = 'll';

CREATE TABLE cities (
name text NOT NULL,
postal_code varchar(9) CHECK (postal_code <> ''),
country_code char(2) REFERENCES countries,
PRIMARY KEY (country_code, postal_code)
);

---
SERIALはシンタックスシュガー not null default nextval('*****_id_seq'::regclass)

¥d venues確認
---

### p.17

CREATE TABLE events (
  event_id SERIAL PRIMARY KEY,
  title text,
  starts timestamp,
  ends   timestamp,
  venue_id integer REFERENCES venues
);

---
INSERT INTO events (title, starts, ends, venue_id)
VALUES ('LARP Club',       '2012-02-15 17:30:00', '2012-02-15 19:30:00', 2), 
       ('April Fools Day', '2012-04-01 00:00:00', '2012-04-01 23:59:00', null), 
       ('Christmas Day',   '2012-12-25 00:00:00', '2012-12-25 23:59:00', null);
---

SELECT e.title, v.name
FROM events e JOIN venues v
ON e.venue_id = v.venue_id;


### p.18

SELECT e.title, v.name
FROM events e LEFT JOIN venues v
  ON e.venue_id = v.venue_id;

SELECT e.title, v.name
FROM events e RIGHT JOIN venues v
  ON e.venue_id = v.venue_id;

SELECT e.title, v.name
FROM events e FULL JOIN venues v
  ON e.venue_id = v.venue_id;


SELECT e.title, v.name
FROM events e CROSS JOIN venues v;

SELECT e.title, v.name
FROM events e, venues v;


### p.19

CREATE INDEX events_title
ON events USING hash (title);

SELECT *
FROM events
WHERE starts >= '2012-04-01';

### p.20

CREATE INDEX events_starts
ON events USING btree (starts);

\di
\dti でまとめてみえる

### 宿題

#### 調べてみよう

1. FAQ と ドキュメント

http://www.postgresql.jp/document/9.3/html/
http://www.postgresql.org/docs/9.3/interactive/index.html
http://wiki.postgresql.org/wiki/FAQ

2.

3. FOREIGN KEY にある MATCH FULL の意味を調べてみよう。

book=# INSERT INTO cities 
book-# VALUES
book-#    ('NULL ONLY'  , null, null);
ERROR:  null value in column "postal_code" violates not-null constraint
DETAIL:  Failing row contains (NULL ONLY, null, null).

book=# insert into venues (name, street_address, postal_code) values ('ccc', 'ddd', '1234');
ERROR:  insert or update on table "venues" violates foreign key constraint "venues_country_code_fkey"
DETAIL:  MATCH FULL does not allow mixing of null and nonnull key values.

#### やってみよう

1. pg_class

book=# \d pg_class
      Table "pg_catalog.pg_class"
     Column     |   Type    | Modifiers 
----------------+-----------+-----------
 relname        | name      | not null
 relnamespace   | oid       | not null
 reltype        | oid       | not null
 reloftype      | oid       | not null
 relowner       | oid       | not null
 relam          | oid       | not null
 relfilenode    | oid       | not null
 reltablespace  | oid       | not null
 relpages       | integer   | not null
 reltuples      | real      | not null
 relallvisible  | integer   | not null
 reltoastrelid  | oid       | not null
 reltoastidxid  | oid       | not null
 relhasindex    | boolean   | not null
 relisshared    | boolean   | not null
 relpersistence | "char"    | not null
 relkind        | "char"    | not null
 relnatts       | smallint  | not null
 relchecks      | smallint  | not null
 relhasoids     | boolean   | not null
 relhaspkey     | boolean   | not null
 relhasrules    | boolean   | not null
 relhastriggers | boolean   | not null
 relhassubclass | boolean   | not null
 relispopulated | boolean   | not null
 relfrozenxid   | xid       | not null
 relminmxid     | xid       | not null
 relacl         | aclitem[] | 
 reloptions     | text[]    | 
Indexes:
    "pg_class_oid_index" UNIQUE, btree (oid)
    "pg_class_relname_nsp_index" UNIQUE, btree (relname, relnamespace)

http://www.postgresql.jp/document/9.2/html/catalog-pg-class.html



select * from pg_class where relkind = 'r' ;


2.

SELECT country_name FROM countries
AS c JOIN venues AS v ON c.country_code = v.country_code
JOIN events AS e ON e.venue_id = v.venue_id
WHERE e.title = 'LARP Club';

3.

ALTER TABLE venues 
  ADD COLUMN active BOOLEAN DEFAULT TRUE;
  
  

### p.21

INSERT INTO countries VALUES ('jp', 'Japan');
INSERT INTO cities VALUES ('Fukuoka', '8100021', 'jp');
INSERT INTO venues (name, street_address, type, postal_code, country_code, active)
VALUES('My Place', '1-20-2 Imaizumi, Chuo-ku', 'public', '8100021', 'jp', TRUE);

INSERT INTO events (title, starts, ends, venue_id)
VALUES ('Moby', '2012-02-06 21:00', '2012-02-06 23:00', (
SELECT venue_id
FROM venues
WHERE name = 'Crystal Ballroom'
) );

INSERT INTO events (title, starts, ends, venue_id) 
VALUES
  ('Wedding', '2012-02-26 21:00:00', '2012-02-26 23:00:00', 2),
  ('Dinner with Mom', '2012-02-26 18:00:00', '2012-02-26 20:30:00', 4),
  ('Valentine’s Day', '2012-02-14 00:00:00', '2012-02-14 23:59:00', null);

---- 2014/05/19はここまで進んだ


### p.22

SELECT count(title)
FROM events
WHERE title LIKE '%Day%';

SELECT min(starts), max(ends) FROM events INNER JOIN venues
ON events.venue_id = venues.venue_id WHERE venues.name = 'Crystal Ballroom';

SELECT count(*) FROM events WHERE venue_id = 1;
SELECT count(*) FROM events WHERE venue_id = 2;
SELECT count(*) FROM events WHERE venue_id = 3;
SELECT count(*) FROM events WHERE venue_id IS NULL;

SELECT venue_id, count(*) FROM events
GROUP BY venue_id
ORDER BY venue_id;

### p.23

SELECT venue_id, count(*)
FROM events
GROUP BY venue_id
HAVING count(*) >= 2 AND venue_id IS NOT NULL;

SELECT venue_id FROM events GROUP BY venue_id;

SELECT DISTINCT venue_id FROM events;
