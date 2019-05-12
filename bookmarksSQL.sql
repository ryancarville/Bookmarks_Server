-- First, remove the table if it exists
drop table if exists savedBookmarks;

-- create the table anew
create table savedBookmarks (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT,
    url TEXT NOT NULL,
    description TEXT,
    rating INTEGER
);

-- insert some test data
-- using a multi-row insert statement here
insert into savedBookmarks (name, url, description, rating)
values
('Site1', 'http://www.site1.com', 'oeqnwokm ojkweqpkompewqjd pokj ewdkpqwdokpoqwdk pkdpqwokd pqwedko', 2),
('Site2', 'http://www.site2.com', 'qokdwjwqo pqwojpoqwm dp jwqdpojkqwdp jpqwpdkqwd pd', 4),
('Site3', 'http://www.site3.com', 'oeqnwokm ojkweqpkompewqjd pokj ewdkpqwdokpoqwdk pkdpqwokd pqwedko',1),
('Site4', 'http://www.site4.com', 'oeqnwokm ojkweqpkompewqjd pokj ewdkpqwdokpoqwdk pkdpqwokd pqwedko',5),
('Site5', 'http://www.site5.com', 'dwqoi qidjwm;qldwkwd qwlkow', 2),
('Site6', 'http://www.site6.com', 'iqowjdmpqojmpmwqj ppoqidm qpwd qwd', 3),
('Site7', 'http://www.site7.com', 'oeqnwokm ojkweqpkompewqjd pokj ewdkpqwdokpoqwdk pkdpqwokd pqwedko',3),
('Site8', 'http://www.site8.com', 'oeqnwokm ojkweqpkompewqjd pokj ewdkpqwdokpoqwdk pkdpqwokd pqwedko',5),
('Site9', 'http://www.site9.com', 'qpowijqwpdkqpm wpqwijpqwmo dpqdwpodkqwpdmwd qw', 1),
('Site10', 'http://www.site10.com', 'oeqnwokm ojkweqpkompewqjd pokj ewdkpqwdokpoqwdk pkdpqwokd pqwedko',3)