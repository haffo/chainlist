var ChainList = artifacts.require("./ChainList.sol")

contract("ChainList", function(accounts){
  var chainListInstance;
  var seller = accounts[1];
  var buyer = accounts[2];
  var articleName = "Article 1";
  var articleDescription = "Description for Article 1";
  var articlePrice = 10;

  it("should throw an exception if you try to buy an article when there is no article for sale yet", function(){
      return ChainList.deployed().then(function(instance){
          chainListInstance = instance;
          return chainListInstance.buyArticle(1, {from : buyer, value: web3.toWei(articlePrice, "ether")});
      }).then(assert.fail).catch(function(error){
        assert(true);
      }).then(function(){
        return chainListInstance.getNumberOfArticles();
      }).then(function(data){
        assert.equal(data.toNumber(), 0,"Number of article must be 0");
      });
  });

  it("should throw an exception if you try to buy an article that does not exist", function(){
      return ChainList.deployed().then(function(instance){
          chainListInstance = instance;
          return chainListInstance.sellArticle(articleName, articleDescription, web3.toWei(articlePrice, "ether"), {from: seller});
      }).then(function(receipt){
        return chainListInstance.buyArticle(2, {from : buyer, value: web3.toWei(articlePrice, "ether")});
      }).then(assert.fail).catch(function(error){
        assert(true);
      }).then(function(){
        return chainListInstance.getNumberOfArticles();
      }).then(function(data){
        assert.equal(data.toNumber(), 1,"Number of article must be 1");
        return chainListInstance.getArticlesForSale();
      }).then(function(data){
        assert.equal(data[0].toNumber(), 1,"article id should be 1" + 1);
        return chainListInstance.articles(data[0]);
      }).then(function(data){
        assert.equal(data[0].toNumber(), 1,"Article id should be 1");
        assert.equal(data[1], seller,"Seller should be " + seller);
        assert.equal(data[2], 0x0, "Buyer should be empty");
        assert.equal(data[3], articleName,"article name must be " + articleName);
        assert.equal(data[4], articleDescription,"article desc must be " + articleDescription);
        assert.equal(data[5].toNumber(),web3.toWei(articlePrice, "ether") ,"article price must be "+ web3.toWei(articlePrice, "ether"));
      });
  });


  it("should throw an exception if you try to buy your own article", function(){
    return ChainList.deployed().then(function(instance){
        chainListInstance = instance;
      return chainListInstance.buyArticle(1, {from: seller, value: web3.toWei(articlePrice, "ether")});
    }).then(assert.fail).catch(function(error){
      assert(true);
    }).then(function(){
      return chainListInstance.articles(1);
    }).then(function(data){
      assert.equal(data[0].toNumber(), 1,"Article id should 1");
      assert.equal(data[1], seller,"Seller should " + seller);
      assert.equal(data[2], 0x0,"Buyer should be empty");
      assert.equal(data[3], articleName,"article name should be " + articleName);
      assert.equal(data[4], articleDescription,"article description should be " + articleDescription);
      assert.equal(data[5].toNumber(),web3.toWei(articlePrice, "ether") ,"article price must be " + web3.toWei(articlePrice, "ether"));
    });

});

it("should throw an exception if you try to buy an article for a value different from its price", function(){
  return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.buyArticle(1,{from: buyer, value: web3.toWei(articlePrice + 1, "ether")});
  }).then(assert.fail).catch(function(error){
    assert(true);
  }).then(function(){
    return chainListInstance.articles(1);
  }).then(function(data){
    assert.equal(data[0].toNumber(), 1,"Article id should 1");
    assert.equal(data[1], seller,"Seller should " + seller);
    assert.equal(data[2], 0x0,"Buyer should be empty");
    assert.equal(data[3], articleName,"article name should be " + articleName);
    assert.equal(data[4], articleDescription,"article description should be " + articleDescription);
    assert.equal(data[5].toNumber(),web3.toWei(articlePrice, "ether") ,"article price must be " + web3.toWei(articlePrice, "ether"));
  });
});

it("should throw an exception if you try to buy an article that has already been sold", function(){
  return ChainList.deployed().then(function(instance){
      chainListInstance = instance;
      return chainListInstance.buyArticle(1, {from: buyer, value: web3.toWei(articlePrice , "ether")});
  }).then(function(receipt){
    return chainListInstance.buyArticle(1, {from: web3.eth.accounts[0], value: web3.toWei(articlePrice , "ether")});
  }).then(assert.fail).catch(function(error){
    assert(true);
  }).then(function(){
    return chainListInstance.articles(1);
  }).then(function(data){
    assert.equal(data[0], 1,"article id should 1");
    assert.equal(data[1], seller,"Seller should " + seller);
    assert.equal(data[2], buyer,"Buyer should be " + buyer);
    assert.equal(data[3], articleName,"article name should be " + articleName);
    assert.equal(data[4], articleDescription,"article description should be " + articleDescription);
    assert.equal(data[5].toNumber(),web3.toWei(articlePrice, "ether") ,"article price must be " + web3.toWei(articlePrice, "ether"));
  });
});



});
