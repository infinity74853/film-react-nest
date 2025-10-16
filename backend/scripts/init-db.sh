psql -U postgres -c "CREATE DATABASE prac;"
psql -U postgres -d prac -f test/prac.init.sql
psql -U postgres -d prac -f test/prac.films.sql
psql -U postgres -d prac -f test/prac.shedules.sql