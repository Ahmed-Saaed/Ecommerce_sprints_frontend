import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import ProductsTable from './productsTable';
import ListGroup from './common/listGroup';
import Pagination from './common/pagination';
import {paginate} from '../utils/paginate';
import {getProducts, deleteProduct} from '../services/productService';
import {getGenres} from '../services/genreService';
import SearchBox from './searchBox';
import _ from 'lodash';

class Products extends Component {
  state = {
    products: [],
    genres: [],
    currentPage: 1,
    pageSize: 4,
    searchQuery: '',
    selectedGenre: null,
    sortColumn: {path: 'title', order: 'asc'},
  };

  async componentDidMount() {
    const {data} = await getGenres();
    const genres = [{_id: '', name: 'All Genres'}, ...data];

    const {data: products} = await getProducts();
    this.setState({products, genres});
  }

  handleDelete = (product) => {
    const products = this.state.products.filter((m) => m._id !== product._id);
    this.setState({products});

    deleteProduct(product._id);
  };

  handleLike = (product) => {
    const products = [...this.state.products];
    const index = products.indexOf(product);
    products[index] = {...products[index]};
    products[index].liked = !products[index].liked;
    this.setState({products});
  };

  handlePageChange = (page) => {
    this.setState({currentPage: page});
  };

  handleGenreSelect = (genre) => {
    this.setState({selectedGenre: genre, currentPage: 1});
  };

  handleSearch = (query) => {
    this.setState({searchQuery: query, selectedGenre: null, currentPage: 1});
  };

  handleSort = (sortColumn) => {
    this.setState({sortColumn});
  };

  getPagedData = () => {
    const {
      pageSize,
      currentPage,
      sortColumn,
      selectedGenre,
      searchQuery,
      products: allProducts,
    } = this.state;

    let filtered = allProducts;
    if (searchQuery)
      filtered = allProducts.filter((m) =>
        m.title.toLowerCase().startsWith(searchQuery.toLowerCase())
      );
    else if (selectedGenre && selectedGenre._id)
      filtered = allProducts.filter((m) => m.genre._id === selectedGenre._id);

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);

    const products = paginate(sorted, currentPage, pageSize);

    return {totalCount: filtered.length, data: products};
  };

  render() {
    const {length: count} = this.state.products;
    const {pageSize, currentPage, sortColumn, searchQuery} = this.state;
    const {user} = this.props;

    if (count === 0) return <p>There are no products in the database.</p>;

    const {totalCount, data: products} = this.getPagedData();

    return (
      <div className='row'>
        <div className='col-3'>
          <ListGroup
            items={this.state.genres}
            selectedItem={this.state.selectedGenre}
            onItemSelect={this.handleGenreSelect}
          />
        </div>
        <div className='col'>
          {user && (
            <Link
              to='/products/new'
              className='btn btn-primary'
              style={{marginBottom: 20}}
            >
              New Product
            </Link>
          )}
          <p>Showing {totalCount} products in the database.</p>
          <SearchBox value={searchQuery} onChange={this.handleSearch} />
          <ProductsTable
            products={products}
            sortColumn={sortColumn}
            onLike={this.handleLike}
            onDelete={this.handleDelete}
            onSort={this.handleSort}
          />
          <Pagination
            itemsCount={totalCount}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageChange={this.handlePageChange}
          />
        </div>
      </div>
    );
  }
}

export default Products;
