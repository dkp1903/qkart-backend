// CRIO_SOLUTION_START_MODULE_UNDERSTANDING_BASICS
// CRIO_SOLUTION_END_MODULE_UNDERSTANDING_BASICS
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Input, message } from "antd";
import React from "react";
import { withRouter } from "react-router-dom";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";

/**
 * @class Login component handles the Login page UI and functionality
 *
 * Contains the following fields
 *
 * @property {boolean} state.loading
 *    Indicates background action pending completion. When true, further UI actions might be blocked
 * @property {string}
 *    state.email User given field for user's email
 * @property {string}
 *    state.password User given field for password
 */
class Login extends React.Component {
  constructor() {
    super();
    this.state = {
      loading: false,
      email: "",
      password: "",
    };
  }

  /**
   * Validate the input values so that any bad or illegal values are not passed to the backend.
   *
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * Return false if any validation condition fails, otherwise return true.
   * -    Check that email field is not an empty value
   * -    Check that password field is not an empty value
   */
  validateInput = () => {
    if (!this.state.email) {
      message.error("Email is a required field");
      return false;
    }
    if (!this.state.password) {
      message.error("Password is a required field");
      return false;
    }
    return true;
  };

  /**
   * Check the response of the API call to be valid and handle any failures along the way
   *
   * @param {boolean} errored
   *    Represents whether an error occurred in the process of making the API call itself
   * @param {{ success: boolean, message?: string, token?: string, email?: string }} response
   *    The response JSON object from API call which may contain further success or error messages
   * @returns {boolean}
   *    Whether validation has passed or not
   *
   * If the API call itself encounters an error, errored flag will be true.
   * If the backend returns an error, then success field will be false and message field will have a string with error details to be displayed.
   * When there is an error in the API call itself, display a generic error message and return false.
   * When there is an error returned by backend, display the given message field and return false.
   * When there is no error and API call is successful, return true.
   */
  validateResponse = (errored, response) => {
    if (errored || (!response.tokens && !response.message)) {
      message.error(
        "Something went wrong. Check that the backend is running, reachable and returns valid JSON."
      );
      return false;
    }
    if (!response.tokens) {
      message.error(response.message);
      return false;
    }
    return true;
  };

  /**
   * Perform the API call over the network and return the response
   *
   * @returns {{ success: boolean, token: string, email: string, balance: number }|undefined}
   *    The response JSON object
   *
   * -    Set the loading state variable to true
   * -    Perform the API call via a fetch call: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
   *      - The call must be made asynchronously using Promises or async/await
   *      - The call must handle any errors thrown from the fetch call
   *      - Parse the result as JSON
   * -    Set the loading state variable to false once the call has completed
   * -    Call the validateResponse(errored, response) function defined previously
   * -    If response passes validation, return the response object
   *
   * Example for successful response from backend:
   * HTTP 200
   * {
   * "user": {
   *     "walletMoney": 500,
   *     "address": "",
   *     "_id": "6005988f06ea6b360cb75747",
   *     "name": "user-name",
   *     "email": "user-email",
   *     "password": "user-pass-enc,
   *     "createdAt": "timestamp",
   *     "updatedAt": "timestamp",
   *     "__v": 0
   * },
   * "tokens": {
   *     "access": {
   *         "token": "user-access-token",
   *         "expires": "expity-timestamp
   *     }
   * }
   * }
   *
   * Example for failed response from backend:
   * HTTP 400
   * {
   *      "code": 400,
   *      "message": "email is required"
   * }
   */
  performAPICall = async () => {
    let response = {};
    let errored = false;
    this.setState({
      loading: true,
    });
    try {
      response = await (
        await fetch(`${config.endpoint}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: this.state.email,
            password: this.state.password,
          }),
        })
      ).json();
    } catch (e) {
      errored = true;
    }
    this.setState({
      loading: false,
    });
    if (this.validateResponse(errored, response)) {
      return response;
    }
  };

  /**
   * Store the login information so that it can be used to identify the user in subsequent API calls
   *
   * @param {string} token
   *    API token used for authentication of requests after logging in
   * @param {string} email
   *    Email of the logged in user
   * @param {string} balance
   *    Wallet balance amount of the logged in user
   *
   * Make use of localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
   * -    `token` field in localStorage can be used to store the Oauth token
   * -    `email` field in localStorage can be used to store the email that the user is logged in as
   * -    `balance` field in localStorage can be used to store the balance amount in the user's wallet
   * -    `username` field in localStorage can be used to store the User's name
   * -    `userId` field in localStorage can be used to store the user ID
   */
  persistLogin = (token, email, balance, name, userId) => {
    localStorage.setItem("token", token);
    localStorage.setItem("email", email);
    localStorage.setItem("balance", balance);
    localStorage.setItem("username", name);
    localStorage.setItem("userId", userId);
  };

  /**
   * Definition for login handler
   * This is the function that is called when the user clicks on the login button or submits the login form
   * -    Call the previously defined validateInput() function and check that is returns true, i.e. the input values pass validation
   * -    Call the previously defined performAPICall() function asynchronously and capture the returned value in a variable
   * -    If the returned value exists,
   *      -   Call the previously defined persistLogin(token, email, balance,username,userId) function
   *      -   Clear the input fields
   *      -   Display a success message
   *      -   Redirect the user to the "/products" page
   */

  /**
   * Definition for login handler
   * This is the function that is called when the user clicks on the login button or submits the login form
   *    - Display a message, "Login logic not implemented yet"
   */

  login = async () => {
    // if (this.validateInput()) {
    const response = await this.performAPICall();
    if (response) {
      this.persistLogin(
        response.tokens.access.token,
        response.user.email,
        response.user.walletMoney,
        response.user.name,
        response.user._id
      );
      this.setState({
        email: "",
        password: "",
      });
      message.success("Logged in successfully");
      this.props.history.push("/products");
    }
    // }
  };

  /**
   * JSX and HTML goes here
   * We have a text field and a password field (each with data binding to state), and a submit button that calls login()
   */
  render() {
    return (
      <>
        {/* Display Header */}
        <Header history={this.props.history} />

        {/* Display Login fields */}
        <div className="flex-container">
          <div className="login-container container">
            <h1>Login to QKart</h1>

            <Input
              className="input-field"
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder="email"
              onChange={(e) => {
                this.setState({
                  email: e.target.value,
                });
              }}
            />

            <Input.Password
              className="input-field"
              prefix={<LockOutlined className="site-form-item-icon" />}
              placeholder="Password"
              onChange={(e) => {
                this.setState({
                  password: e.target.value,
                });
              }}
            />

            <Button
              loading={this.state.loading}
              type="primary"
              onClick={this.login}
            >
              Login
            </Button>
          </div>
        </div>

        {/* Display the footer */}
        <Footer></Footer>
      </>
    );
  }
}

// export default Login;

export default withRouter(Login);
