// CRIO_SOLUTION_START_MODULE_UNDERSTANDING_BASICS
// CRIO_SOLUTION_END_MODULE_UNDERSTANDING_BASICS
import { Button } from "antd";
import React from "react";
import { Link, withRouter } from "react-router-dom";
import Header from "./Header";
import "./Thanks.css";

class Thanks extends React.Component {
  /**
   * The goal is to display a simple thank you page that the user will see after a successful order goes through
   * Items to display can include:
   * -    Thank you text
   * -    Remaining wallet balance
   * -    Link to go back to Products page to shop more
   * @returns {JSX} HTML and JSX to be rendered
   */
  render() {
    return (
      <>
        {/* Display Header */}
        <Header history={this.props.history} />

        {/* Display order details */}
        <div className="thanks-container">
          <h1 style={{ fontWeight: "600" }}>It's ordered!</h1>

          <div className="green-text thanks-line">
            You will receive an invoice for your order shortly.
            <br />
            Your order will arrive in 7 business days.
          </div>

          <div className="thanks-line">
            Wallet balance: <br></br>₹{localStorage.getItem("balance")}{" "}
            available
          </div>

          <Link to="/products" className="thanks-line">
            <Button type="primary">Browse for more products</Button>
          </Link>
        </div>
      </>
    );
  }
}

export default withRouter(Thanks);
