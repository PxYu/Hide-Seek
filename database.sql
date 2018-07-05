-- keep each user profiles
CREATE TABLE users (
    userID varchar(48) NOT NULL,
    -- user's profile which is a json file converted to a string
    profile MEDIUMTEXT,
    PRIMARY KEY (userID)
);

-- keep each user's query history
CREATE TABLE queries (
    -- actionID is a shorter version of session
    actionID int NOT NULL,
    sessionID int NOT NULL,
    query varchar(100) NOT NULL,
    topic varchar(100),
    topicNo int,
    -- (0: user query, 1: java program query, 2: python program query)
    tag int NOT NULL,
    userID varchar(48) NOT NULL,
    time varchar(100) NOT NULL,
    FOREIGN KEY (userID) REFERENCES users(userID)
);

-- keep each click, including users' and simulated ones
CREATE TABLE clicks (
    userID varchar(48) NOT NULL,
    url varchar(255) NOT NULL,
    title varchar(255) NOT NULL,
    query varchar(100) NOT NULL,
    -- (1: user click, 0: simulation click)
    tag int NOT NULL,
    idx int NOT NULL,
    time varchar(100) NOT NULL,
    FOREIGN KEY (userID) REFERENCES users(userID)
);