// CRIO_SOLUTION_START_MODULE_UNDERSTANDING_BASICS
// CRIO_SOLUTION_END_MODULE_UNDERSTANDING_BASICS
import { PlusCircleOutlined } from "@ant-design/icons";
import { Button, Card, Rate } from "antd";
import React from "react";
import "./Product.css";

/**
 * @typedef {Object} Product
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * The goal is to display an individual product as a card displaying relevant product properties
 * Product image and product title are primary information
 * Secondary information to be displayed includes cost, rating and category
 * We also need a button to add the product to cart from the product listing
 *
 * @param {Product} props.product
 *    The product object to be displayed
 * @param {function} props.addToCart
 *    Function to call when user clicks on a Product card's 'Add to cart' button
 * @returns {JSX}
 *    HTML and JSX to be rendered
 */
export default function Product(props) {
  return (
    // Use Antd Card component to create a card-like view for individual products
    <Card className="product" hoverable>
      {/* Display product image */}
      <img className="product-image" alt="product" src={props.product.image} />

      {/* Display product information */}
      <div className="product-info">
        {/* Display product name and category */}
        <div className="product-info-text">
          <div className="product-title">{props.product.name}</div>
          <div className="product-category">{`Category: ${props.product.category}`}</div>
        </div>

        {/* Display utility elements */}
        <div className="product-info-utility">
          {/* Display product cost */}
          <div className="product-cost">{`₹${props.product.cost}`}</div>

          {/* Display star rating for the product on a scale of 5 */}
          <div>
            <Rate
              className="product-rating"
              disabled={true}
              defaultValue={props.product.rating}
            />
          </div>

          {/* Display the "Add to Cart" button */}
          <Button
            shape="round"
            type="primary"
            icon={<PlusCircleOutlined />}
            onClick={props.addToCart}
          >
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
}
