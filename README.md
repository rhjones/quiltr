# Quiltr

Create patterns. Make quilts. Be inspired.

- Live app: [Quiltr](https://rhjones.github.io/quiltr/)
- Live API: [Quiltr API](https://quiltr.herokuapp.com/)
- API repo on GitHub: [rhjones/quiltr-api](https://github.com/rhjones/quiltr-api)

![Screenshot of Quiltr](https://github.com/rhjones/quiltr/blob/master/readme-img/quiltr.png)

## About Quiltr

[Quiltr](https://rhjones.github.io/quiltr/) lets users generate random geometric quilt patterns in a range of sizes and color schemes. Users can save patterns to their "favorites" and browse a gallery of all patterns on the site. Users can also create projects based on these patterns and share their notes about and photos of each project.

Quiltr is built in Ember and relies on a Rails API/Postgres to persist data. Code for that API can be found at [rhjones/quiltr-api](https://github.com/rhjones/quiltr-api).

## Project Planning

[Pitch Deck](https://docs.google.com/presentation/d/1_x60v_O56g49k7vBix-rbFNC4JuevlIhEjBSj2j6ENg/edit?usp=sharing)

### User Stories

- I want to view randomly generated patterns for quilts based on the following variables: quilt size, block size, # of colors.
- I want to be able to save my favorite quilt patterns to an account.
- I want to be able to share (link directly to) patterns
- I want to be able to save a "project" connected to a pattern that includes my notes on making the quilt and my photo of that quilt 
- I want to be able to view a gallery of all users' projects
- I want to be able to look at the gallery (patterns + projects) without logging in

### User stories (stretch)
- (COMPLETED) I want to be able to generate random patterns w/o logging in
- (COMPLETED) I want to be able to upload multiple photos of each quilt that I make
- I want to be able to sort the project gallery by quilt size, block size, and # of colors
- I want to view a pattern that includes the following: block counts for each type/color, fabric amounts for each color, and basic instructions

### Wireframes
- [Home page](https://github.com/rhjones/quiltr/blob/docs/readme-img/quiltr_wireframes0.jpg)
- [Log in & authenticated user home page](https://github.com/rhjones/quiltr/blob/docs/readme-img/quiltr_wireframes1.jpg)
- [Pattern / project view](https://github.com/rhjones/quiltr/blob/docs/readme-img/quiltr_wireframes2.jpg)
- [Pattern / project 'card' view](https://github.com/rhjones/quiltr/blob/docs/readme-img/quiltr_wireframes3.jpg)
- [Pattern view](https://github.com/rhjones/quiltr/blob/docs/readme-img/quiltr_wireframes4.jpg)


### Data Model

- [ERD](https://github.com/rhjones/quiltr/blob/docs/readme-img/quiltr_ERD.png)
- For full details, see the [rhjones/quiltr-api](https://github.com/rhjones/quiltr-api) repo

## Development Process

I began with what I saw as the most challenging aspect of the project: getting file uploads to work through Ember to Rails, to Amazon S3, and back. I documented my work with Rails/S3 at https://github.com/ga-wdi-boston/rails-paperclip/issues/15. In Ember, I kept things fairly simple and wrote a service to handle a custom AJAX request to send data pulled from a form using `FormData`.

After getting uploads to work, I built out the rest of the resources and relationships in the API. After testing the API with CURL scripts, I came back to Ember and integrated front-end authentication, then began setting up routes and models to handle patterns and projects.

Generating the patterns was the most fun: I wrote a custom service that uses [Fabric.js](https://github.com/kangax/fabric.js/) to draw a random series of squares and "half square triangles" on a canvas, based on the quilt size, the individual block size, and the total number of colors given by the user. A user can generate multiple patterns in a row; patterns are only persisted to the database when a user "favorites" them. At that point, the SVG string is exported from the Fabric canvas and stored so it can be displayed elsewhere throughout the site. 

## Dependencies

Install build dependencies with `npm install`. Install runtime dependencies with
`bower install`.

-   [ember.js](http://emberjs.com/)
-   [ember-cli](http://www.ember-cli.com/)
-   [Bootstrap](http://getbootstrap.com)
-   [fabric.js](https://github.com/kangax/fabric.js) for quilt pattern generation and SVG manipulation
-   [moment.js](http://momentjs.com/) for date formatting

## Additional Tech Used

See [rhjones/quiltr-api](https://github.com/rhjones/quiltr-api) for installation instructions.

- [ImageMagick](http://www.imagemagick.org/) (for image handling via Paperclip)
- [paperclip](https://github.com/thoughtbot/paperclip) (for image uploading through Rails to S3)

## Next Steps

- Build functionality to sort the pattern gallery by quilt size, block size, color scheme, and number of colors
- Include block counts for each type/color, fabric amounts for each color, and more detailed piecing and quilting instructions
- Add ability to expand/minimize photos, perhaps including a full-size gallery component
- Enable users to choose their own colors
- Use Ember controllers to enable redirection from certain routes to sign in & back to those routes automatically
- Integrate Pinterest, including S3 uploads of PNG versions of patterns (the API can handle this; it's just a matter of building the front end functionality)
- Add "counts" of projects & favorites so a user can see how many other users have favorited or made a pattern
- Implement pagination on galleries, favorites, and my-projects views

## [License](LICENSE)

1.  All content is licensed under a CC­BY­NC­SA 4.0 license.
1.  All software code is licensed under GNU GPLv3.