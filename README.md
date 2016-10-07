# DawgTown

This Repository contains all of the code pertaining to the API for the DawgTown API the structure is as follows

1) app/models : this contains all of the database models for the app. These databases are

    a) user - information about the users
  
    b) bones - information about the location (lat/long) of the bones and their value in the app
  
    c) companies - information about the companies that participate in the app
  
    d) prizes - information about the prizes that may be redeemed with bones 
  
 Map Reduce DBs:
  
    e) User-bone - this database keeps track of which bones every active user has collected
  
    f) User-prizes - this database tracks the prizes owned by all users
  
  
  
2) views : all the html documents that will be loaded by the API

3) config.js : config file for node dependencies

4) server.js : API
