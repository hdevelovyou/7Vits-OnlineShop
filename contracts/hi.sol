// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract OnlineShop {
    address public owner;

    struct Product {
        uint id;
        string name;
        uint price;
        uint stock;
    }

    mapping(uint => Product) public products;
    uint public productCount;

    event ProductAdded(uint id, string name, uint price, uint stock);
    event ProductPurchased(uint id, address buyer, uint quantity);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addProduct(string memory _name, uint _price, uint _stock) public onlyOwner {
        require(_price > 0, "Price must be greater than zero");
        require(_stock > 0, "Stock must be greater than zero");

        productCount++;
        products[productCount] = Product(productCount, _name, _price, _stock);

        emit ProductAdded(productCount, _name, _price, _stock);
    }

    function purchaseProduct(uint _id, uint _quantity) public payable {
        Product storage product = products[_id];
        require(product.id != 0, "Product does not exist");
        require(product.stock >= _quantity, "Not enough stock available");
        require(msg.value == product.price * _quantity, "Incorrect payment amount");

        product.stock -= _quantity;

        emit ProductPurchased(_id, msg.sender, _quantity);
    }

    function withdrawFunds() public onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
} 