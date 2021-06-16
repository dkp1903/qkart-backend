// CRIO_SOLUTION_START_MODULE_UNDERSTANDING_BASICS
// CRIO_SOLUTION_END_MODULE_UNDERSTANDING_BASICS
import { Button, message, Radio, Row, Col } from "antd";
import TextArea from "antd/lib/input/TextArea";
import React from "react";
import { withRouter } from "react-router-dom";
import { config } from "../App";
import Cart from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";

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
 * @typedef {Object} Address
 * @property {string} _id - Unique ID for the address
 * @property {string} address - Full address string
 */

/**
 * @class Checkout component handles the Checkout page UI and functionality
 *
 * Contains the following fields
 * @property {React.RefObject} cartRef
 *    Reference to Cart component (to trigger certain methods within the cart component)
 * @property {Product[]} state.products
 *    List of products fetched from backend
 * @property {Address[]} state.address
 *    List of user's address fetched from backend
 * @property {number} state.selectedAddressIndex
 *    Index for which of the user's addresses is currently selected
 * @property {string} state.newAddress
 *    Data binding for the input field to enter a new address
 * @property {number} state.balance
 *    Balance amount in the current user's wallet
 * @property {boolean} state.loading
 *    Indicates background action pending completion. When true, further UI actions might be blocked
 */
class Checkout extends React.Component {
  constructor() {
    super();
    this.cartRef = React.createRef();
    this.state = {
      products: [],
      address: "",
      selectedAddressIndex: 0,
      newAddress: "",
      balance: 0,
      loading: false,
    };
  }

  /**
   * Check the response of the getProducts() API call to be valid and handle any failures along the way
   *
   * @param {boolean} errored
   *    Represents whether an error occurred in the process of making the API call itself
   * @param {Product[]|{ success: boolean, message: string }} response
   *    The response JSON object which may contain further success or error messages
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * If the API call itself encounters an error, errored flag will be true.
   * If the backend returns an error, then success field will be false and message field will have a string with error details to be displayed.
   * When there is an error in the API call itself, display a generic error message and return false.
   * When there is an error returned by backend, display the given message field and return false.
   * When there is no error and API call is successful, return true.
   */
  validateGetProductsResponse = (errored, response) => {
    if (errored || (!response.length && !response.message)) {
      message.error(
        "Could not fetch products. Check that the backend is running, reachable and returns valid JSON."
      );
      return false;
    }

    if (!response.length) {
      message.error(response.message || "No products found in database");
      return false;
    }

    return true;
  };

  /**
   * Perform the API call to fetch all products from backend
   * -    Set the loading state variable to true
   * -    Perform the API call via a fetch call: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
   * -    The call must be made asynchronously using Promises or async/await
   * -    The call must handle any errors thrown from the fetch call
   * -    Parse the result as JSON
   * -    Set the loading state variable to false once the call has completed
   * -    Call the validateGetProductsResponse(errored, response) function defined previously
   * -    If response passes validation, and the response exists,
   *      -   Update products state variable with the response
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  getProducts = async () => {
    let response = {};
    let errored = false;

    this.setState({
      loading: true,
    });

    try {
      response = await (await fetch(`${config.endpoint}/products`)).json();
    } catch (e) {
      errored = true;
    }

    this.setState({
      loading: false,
    });

    if (this.validateGetProductsResponse(errored, response)) {
      if (response) {
        this.setState({
          products: response,
        });
      }
    }
  };

  /**
   * Check the response of other API calls to be valid and handle any failures along the way
   *
   * @param {boolean} errored
   *    Represents whether an error occurred in the process of making the API call itself
   * @param {Address[]|{ success: boolean, message?: string }} response
   *    The response JSON object which may contain further success or error messages
   * @param {string} couldNot
   *    String indicating what could not be loaded
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * If the API call itself encounters an error, errored flag will be true.
   * If the backend returns an error, then success field will be false and message field will have a string with error details to be displayed.
   * When there is an error in the API call itself, display a generic error message and return false.
   * When there is an error returned by backend, display the given message field and return false.
   * When there is no error and API call is successful, return true.
   */
  validateResponse = (errored, response, couldNot) => {
    if (errored) {
      message.error(
        `Could not ${couldNot}. Check that the backend is running, reachable and returns valid JSON.`
      );
      return false;
    }
    if (response.message) {
      message.error(response.message);
      return false;
    }
    return true;
  };

  /**
   * Perform the API call to fetch the user's addresses from backend
   * -    Set the loading state variable to true
   * -    Perform the API call via a fetch call: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
   * -    The call must be made asynchronously using Promises or async/await
   * -    The call must be authenticated with an authorization header containing Oauth token
   * -    The call must handle any errors thrown from the fetch call
   * -    Parse the result as JSON
   * -    Set the loading state variable to false once the call has completed
   * -    Call the validateResponse(errored, response, couldNot) function defined previously
   * -    If response passes validation, update the addresses state variable
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "_id": "m_rg_eW5kLALNcn70kpyR",
   *          "address": "No. 341, Banashankari, Bangalore, India"
   *      },
   *      {
   *          "_id": "9sW_60WkwrT7gDPmgUdoP",
   *          "address": "123 Main Street, New York, NY 10030"
   *      },
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  getAddresses = async () => {
    let response = {};
    let errored = false;

    this.setState({
      loading: true,
    });

    try {
      response = await (
        await fetch(
          `${config.endpoint}/users/${localStorage.getItem(
            "userId"
          )}?q=address`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
      ).json();
    } catch (e) {
      errored = true;
    }

    this.setState({
      loading: false,
    });

    if (this.validateResponse(errored, response, "fetch addresses")) {
      if (response) {
        this.setState({
          address:
            response.address !== "ADDRESS_NOT_SET" ? response.address : "",
        });
      }
    }
  };

  /**
   * Perform the API call to add an address for the user
   * -    Set the loading state variable to true
   * -    Perform the API call via a fetch call: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
   * -    The call must be made asynchronously using Promises or async/await
   * -    The call must be authenticated with an authorization header containing Oauth token
   * -    The call must handle any errors thrown from the fetch call
   * -    Parse the result as JSON
   * -    Set the loading state variable to false once the call has completed
   * -    Call the validateResponse(errored, response, couldNot) function defined previously
   * -    If response passes validation, and response exists,
   *      -   Show an appropriate success message
   *      -   Clear the new address input field
   *      -   Call getAddresses() to refresh list of addresses
   *
   * Example for successful response from backend:
   * HTTP 200
   * {
   *      "success": true
   * }
   *
   * Example for failed response from backend:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Address should be greater than 20 characters"
   * }
   */
  addAddress = async () => {
    let response = {};
    let errored = false;

    this.setState({
      loading: true,
    });

    try {
      response = await (
        await fetch(
          `${config.endpoint}/users/${localStorage.getItem(
            "userId"
          )}?q=address`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              address: this.state.newAddress,
            }),
          }
        )
      ).json();
    } catch (e) {
      errored = true;
    }

    this.setState({
      loading: false,
    });

    if (this.validateResponse(errored, response, "add a new address")) {
      if (response) {
        message.success("Address added");

        this.setState({
          newAddress: "",
        });

        await this.getAddresses();
      }
    }
  };

  /**
   * Perform the API call to delete an address for the user
   *
   * @param {string} addressId
   *    ID of the address record to delete
   *
   * -    Set the loading state variable to true
   * -    Perform the API call via a fetch call: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
   * -    The call must be made asynchronously using Promises or async/await
   * -    The call must be authenticated with an authorization header containing Oauth token
   * -    The call must handle any errors thrown from the fetch call
   * -    Parse the result as JSON
   * -    Set the loading state variable to false once the call has completed
   * -    Call the validateResponse(errored, response, couldNot) function defined previously
   * -    If response passes validation, and response exists,
   *      -   Show an appropriate success message
   *      -   Call getAddresses() to refresh list of addresses
   *
   * Example for successful response from backend:
   * HTTP 200
   * {
   *      "success": true
   * }
   *
   * Example for failed response from backend:
   * HTTP 404
   * {
   *      "success": false,
   *      "message": "Address to delete was not found"
   * }
   */
  deleteAddress = async (addressId) => {
    let response = {};
    let errored = false;

    this.setState({
      loading: true,
    });

    try {
      response = await (
        await fetch(`${config.endpoint}/user/addresses/${addressId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        })
      ).json();
    } catch (e) {
      errored = true;
    }

    this.setState({
      loading: false,
    });

    if (this.validateResponse(errored, response, "delete address")) {
      if (response) {
        message.success("Address deleted");

        await this.getAddresses();
      }
    }
  };

  /**
   * Perform the API call to place an order
   *
   * -    Set the loading state variable to true
   * -    Perform the API call via a fetch call: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
   * -    The call must be made asynchronously using Promises or async/await
   * -    The call must be authenticated with an authorization header containing Oauth token
   * -    The call must handle any errors thrown from the fetch call
   * -    Parse the result as JSON
   * -    Set the loading state variable to false once the call has completed
   * -    Call the validateResponse(errored, response, couldNot) function defined previously
   * -    If response passes validation, and response exists,
   *      -   Show an appropriate success message
   *      -   Update the localStorage field for `balance` to reflect the new balance
   *      -   Redirect the user to the thanks page
   *
   * Example for successful response from backend:
   * HTTP 200
   * {
   *      "success": true
   * }
   *
   * Example for failed response from backend:
   * HTTP 400
   * {
   *      "success": false,
   *      "message": "Wallet balance not sufficient to place order"
   * }
   */
  checkout = async () => {
    let response = {};
    let errored = false;

    this.setState({
      loading: true,
    });

    try {
      response = await fetch(`${config.endpoint}/cart/checkout`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
    } catch (e) {
      errored = true;
      console.log(e);
    }

    this.setState({
      loading: false,
    });

    let data;
    if (response.status !== 204) {
      data = await response.json();
    }
    if (response.status === 204 || this.validateResponse(errored, data)) {
      message.success("Order placed");

      console.log(this.cartRef.current.calculateTotal());
      localStorage.setItem(
        "balance",
        parseInt(localStorage.getItem("balance")) -
          this.cartRef.current.calculateTotal()
      );

      this.props.history.push("/thanks");
    }
  };

  /**
   * Function that is called when the user clicks on the place order button
   * -    If the user's wallet balance is less than the total cost of the user's cart, then display an appropriate error message
   * -    Else if the user does not have any addresses, or has not selected an available address, then display an appropriate error message
   * -    Else call the checkout() method to proceed with placing and order
   */
  order = () => {
    this.checkout();
  };

  /**
   * Function that runs when component has loaded
   * This is the function that is called when the user lands on the Checkout page
   * If the user is logged in (i.e. the localStorage fields for `username` and `token` exist), fetch products and addresses from backend (asynchronously) to component state
   * Update the balance state variable with the value stored in localStorage
   * Else, show an error message indicating that the user must be logged in first and redirect the user to the home page
   */
  async componentDidMount() {
    if (localStorage.getItem("username") && localStorage.getItem("token")) {
      await this.getProducts();
      await this.getAddresses();

      this.setState({
        balance: localStorage.getItem("balance"),
      });
    } else {
      message.error("You must be logged in to visit the checkout page");
      this.props.history.push("/");
    }
  }

  /**
   * JSX and HTML goes here
   * We display the cart component as the main review for the user on this page (Cart component must know that it should be non-editable)
   * We display the payment method and wallet balance
   * We display the list of addresses for the user to select from
   * If the user has no addresses, appropriate text is displayed instead
   * A text field (and button) is required so the user may add a new address
   * We display a link to the products page if the user wants to shop more or update cart
   * A button to place the order is displayed
   */
  render() {
    const radioStyle = {
      display: "block",
      height: "30px",
      lineHeight: "30px",
    };

    return (
      <>
        {/* Display Header */}
        <Header history={this.props.history} />

        {/* Display Checkout page content */}
        <div className="checkout-container">
          <Row>
            {/* Display checkout instructions */}

            <Col xs={{ span: 24, order: 2 }} md={{ span: 18, order: 1 }}>
              <div className="checkout-shipping">
                <h1 style={{ marginBottom: "-10px" }}>Shipping</h1>

                <hr></hr>
                <br></br>

                <p>Shipping Address</p>

                {/* Display the "Shipping" sectino */}
                <div className="address-section">
                  {this.state.address.length ? (
                    <div className="address-box">
                      {/* Display address title */}
                      <div className="address-text">{this.state.address}</div>

                      {/* Display button to delete address from user's list */}
                      {/* <Button
                                    type="primary"
                                    
                                    onClick={async () => {
                                      await this.deleteAddress(address._id);
                                    }}
                                    
                                  >
                                    Delete
                                  </Button> */}
                    </div>
                  ) : (
                    // Display the list of addresses as radio buttons
                    // <Radio.Group
                    //   className="addresses"
                    //   defaultValue={this.state.selectedAddressIndex}
                    //   onChange={e => {
                    //     this.setState({
                    //       selectedAddressIndex: e.target.value
                    //     });
                    //   }}
                    // >
                    //   <Row>
                    //     {/* Create a view for each of the user's addresses */}
                    //     {this.state.address && (
                    //       <Col xs={24} lg={12} key={"address"}>
                    //         <div className="address">
                    //           <Radio.Button value={"address#1"}>
                    //             <div className="address-box">
                    //               {/* Display address title */}
                    //               <div className="address-text">
                    //                 {this.state.address}
                    //               </div>

                    //               {/* Display button to delete address from user's list */}
                    //               {/* <Button
                    //                 type="primary"

                    //                 onClick={async () => {
                    //                   await this.deleteAddress(address._id);
                    //                 }}

                    //               >
                    //                 Delete
                    //               </Button> */}
                    //             </div>
                    //           </Radio.Button>
                    //         </div>
                    //       </Col>
                    //     )}
                    //   </Row>
                    // </Radio.Group>
                    // Display static text banner if no addresses are added
                    <div className="red-text checkout-row">
                      No addresses found. Please add one to proceed.
                    </div>
                  )}

                  <div className="checkout-row">
                    {/* Text input field to type a new address */}
                    <div>
                      <TextArea
                        className="new-address"
                        placeholder={
                          this.state.address
                            ? "Update Address"
                            : "Add new address"
                        }
                        rows={4}
                        value={this.state.newAddress}
                        onChange={(e) => {
                          this.setState({
                            newAddress: e.target.value,
                          });
                        }}
                      />
                    </div>

                    {/* Button to submit address added */}
                    <div>
                      <Button type="primary" onClick={this.addAddress}>
                        {this.state.address
                          ? "Update Address"
                          : "Add new address"}
                      </Button>
                    </div>
                  </div>
                </div>

                <br></br>

                {/* Display the "Pricing" section */}
                <div>
                  <h1 style={{ marginBottom: "-10px" }}>Pricing</h1>

                  <hr></hr>

                  <h2>Payment Method</h2>

                  <Radio.Group value={1}>
                    <Radio style={radioStyle} value={1}>
                      Wallet
                      <strong> (₹{this.state.balance} available)</strong>
                    </Radio>
                  </Radio.Group>
                </div>

                <br></br>

                {/* Button to confirm order */}
                <Button
                  className="ant-btn-success"
                  loading={this.state.loading}
                  type="primary"
                  onClick={this.order}
                >
                  <strong>Place Order</strong>
                </Button>
              </div>
            </Col>

            {/* Display the cart */}

            <Col
              xs={{ span: 24, order: 1 }}
              md={{ span: 6, order: 2 }}
              className="checkout-cart"
            >
              <div>
                {this.state.products.length && (
                  <Cart
                    ref={this.cartRef}
                    products={this.state.products}
                    history={this.props.history}
                    token={localStorage.getItem("token")}
                    checkout={true}
                  />
                )}
              </div>
            </Col>
          </Row>
        </div>

        {/* Display the footer */}
        <Footer></Footer>
      </>
    );
  }
}

export default withRouter(Checkout);
