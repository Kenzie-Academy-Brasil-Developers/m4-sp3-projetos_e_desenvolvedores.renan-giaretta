CREATE TYPE "OS" AS ENUM ('Windows', 'Linux', 'MacOS');

CREATE TABLE IF NOT EXISTS developer_infos(
	"id" SERIAL PRIMARY KEY,
	"developerInfoDeveloperSince" DATE NOT NULL,
	"developerInfoPreferredOS" "OS" NOT NULL
);

CREATE TABLE IF NOT EXISTS developers(
	"developerId" SERIAL PRIMARY KEY,
	"developerName" VARCHAR(50) NOT NULL,
	"developerEmail" VARCHAR(50) UNIQUE NOT NULL,
	"developerInfoId" INTEGER UNIQUE
);

ALTER TABLE "developers" ADD CONSTRAINT "fk_developerInfoId" FOREIGN KEY ( "developerInfoId" ) REFERENCES "developer_infos" ( "id" );

CREATE TABLE IF NOT EXISTS projects(
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(50) NOT NULL,
	"description" TEXT NOT NULL,
	"estimatedTime" VARCHAR(20) NOT NULL,
	"repository" VARCHAR(120) NOT NULL,
	"startDATE" DATE NOT NULL,
	"endDate" DATE,
	"developerId" INTEGER NOT NULL
);

ALTER TABLE "projects" ADD CONSTRAINT "fk_developerId" FOREIGN KEY ( "developerId" ) REFERENCES "developers" ( "id" );

CREATE TYPE "tech" AS ENUM ('JavaScript', 'Python', 'React', 'Express.js', 'HTML', 'CSS', 'Django', 'PostgreSQL', 'MongoDB');

CREATE TABLE IF NOT EXISTS technologies(
	"id" SERIAL PRIMARY KEY,
	"name" VARCHAR(30) NOT NULL,
	"technology" "tech" NOT NULL
);

CREATE TABLE IF NOT EXISTS projects_technologies(
	"id" SERIAL PRIMARY KEY,
	"addedIn" DATE NOT NULL,
	"projectId" INTEGER NOT NULL,
	"technologyId" INTEGER NOT NULL
);

ALTER TABLE "projects_technologies" ADD CONSTRAINT "fk_projectId" FOREIGN KEY ( "projectId" ) REFERENCES "projects" ( "id" );


ALTER TABLE "projects_technologies" ADD CONSTRAINT "fk_technologyId" FOREIGN KEY ( "technologyId" ) REFERENCES "technologies" ( "id" );



