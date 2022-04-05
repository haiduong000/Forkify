import * as model from './model.js';
import {MODAL_CLOSE_SEC} from './config.js'
import searchView from './views/searchView.js';
import recipeView from './views/recipeView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import AddRecipeView from './views/addRecipeView.js';
// for old browsers
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime/runtime';
import addRecipeView from './views/addRecipeView.js';

// if(module.hot) {
//   module.hot.accept();
// }

// show the recipe for UI
const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);

    // render the spinner
    if (!id) return;
    recipeView.renderSpinner();
    // 0, Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());
    // 1, Update bookmark view
    bookmarksView.update(model.state.bookmarks);
    
    // 2, Loading recipe from model.js
    await model.loadRecipe(id);
    
    // 3, Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    recipeView.renderError();
    console.error(err);
  }
};

const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();
    // Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // Load search results
    await model.loadSearchResult(query);

    // Render results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  // Render new results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // render new pagination buttons
  paginationView.render(model.state.search);
};

// Serving functionality
const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

// bookmark
const controlAddBookmark = function () {
  // 1, Add or remove bookmark
  if (!model.state.recipe.bookmarks) {
    model.addBookMark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }
  // update recipe view
  recipeView.update(model.state.recipe);
  // 3, render the bookmark
  bookmarksView.render(model.state.bookmarks);
};
const controlBookmarks = function() {
  bookmarksView.render(model.state.bookmarks)
}
const controlAddRecipe = async function(newRecipe) {
  try{
     // Show loading spinner
    addRecipeView.renderSpinner();
    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // render recipe 
    recipeView.render(model.state.recipe);

    // Success message 
    addRecipeView.renderMessage();

    // Render the bookmarks
    bookmarksView.render(model.state.bookmarks);

    // change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`); // change the URL without reload
    
    // close form window
    setTimeout(function() {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000);
  } catch(err) {
    console.error(err);
    addRecipeView.renderError(err.message);
  }
}

const init = function () {
  bookmarksView.addHandleRender(controlBookmarks)
  recipeView.addHandleRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandleAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
