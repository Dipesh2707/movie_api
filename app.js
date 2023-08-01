const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error:${e.message} `);
    process.exit(1);
  }
};
initializeDBAndServer();

convertDbObjToResponseMovie = (dbObj) => {
  return {
    movieId: dbObj.movie_id,
    directorId: dbObj.director_id,
    movieName: dbObj.movie_name,
    leadActor: dbObj.lead_actor,
  };
};

convertDbObjToResponseDirector = (dbOb) => {
  return {
    directorId: dbOb.director_id,
    directorName: dbOb.director_name,
  };
};

app.get("/movies/", async (request, response) => {
  const getMovies = `
    SELECT 
    movie_name
    FROM
    movie; 
    `;
  const movieNames = await db.all(getMovies);
  response.send(
    movieNames.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
    INSERT INTO 
    movie (director_id, movie_name, lead_actor)
    VALUES
    (${directorId}, '${movieName}', '${leadActor}');
    `;
  await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovies = `
    SELECT 
    *
    FROM
    movie
    WHERE movie_id=${movieId};
    `;
  const movie = await db.get(getMovies);
  response.send(convertDbObjToResponseMovie(movie));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateArray = `
    UPDATE
    movie
    SET 
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE
    movie_id=${movieId};
    `;
  await db.run(updateArray);
  response.send("Movie Details Updated");
});

//delete a movie

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `
    DELETE FROM
       movie
    WHERE
       movie_id = ${movieId}  ;
    `;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

//Director get method

app.get("/directors/", async (request, response) => {
  const getDirectors = `
    SELECT 
    *
    FROM
    director; 
    `;
  const directorArray = await db.all(getDirectors);
  response.send(
    directorArray.map((eachDirector) =>
      convertDbObjToResponseDirector(eachDirector)
    )
  );
});

//add director

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorQuery = `
    SELECT 
    movie_name
    FROM
    movie
    WHERE director_id= '${directorId}';
    `;
  const movieArray = await db.all(getDirectorQuery);
  response.send(
    movieArray.map((eachMovie) => ({ movieName: eachMovie.movie_name }))
  );
});

module.exports = app;
