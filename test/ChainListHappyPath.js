var ChainList = artifacts.require("./ChainList.sol")
contract('ChainList', function(accounts){
    var chainListInstance;
    var seller = accounts[1];
    var buyer = accounts[2];
    var sellerBalanceBeforeBuying, sellerBalanceAfterBuying;
    var buyerBalanceBeforeBuying, buyerBalanceAfterBuying;

    var articleName1 = "article 1";
    var articleDescription1 = "article 1 desc";
    var articlePrice1 = 10;

    var articleName2 = "article 2";
    var articleDescription2 = "article 2 desc";
    var articlePrice2 = 20;


    it('should be initialized with empty values', function(){
        return ChainList.deployed().then(function(instance){
            chainListInstance = instance;
            return chainListInstance.getNumberOfArticles();
        }).then(function(data){
            assert.equal(data.toNumber(), 0,"Number of article must be 0");
            return chainListInstance.getArticlesForSale();
        }).then(function(data){
            assert.equal(data.length, 0,"There shouldn't be any article for sale");
         });
    });

    it("Should let us sell a first article", function(){
        return ChainList.deployed().then(function(instance){
          chainListInstance = instance;
          return chainListInstance.sellArticle(articleName1,articleDescription1, web3.toWei(articlePrice1, "ether"), {from : seller});
        }). then(function(receipt){
          assert.equal(receipt.logs.length, 1, "event should be logged");
          assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be named LogSellArticle");
          assert.equal(receipt.logs[0].args._id.toNumber(),1, " article id must be 1");
          assert.equal(receipt.logs[0].args._seller,seller, "event seller must be " + seller);
          assert.equal(receipt.logs[0].args._name,articleName1, "event articleName must be " + articleName1);
          assert.equal(receipt.logs[0].args._price.toNumber(),web3.toWei(articlePrice1, "ether"), "event articlePrice must be " + web3.toWei(articlePrice1, "ether"));
          return chainListInstance.getNumberOfArticles();
        }).then(function(data){
          assert.equal(data.toNumber(), 1,"Number of article must be 1");
          return chainListInstance.getArticlesForSale();
        }).then(function(data){
          assert.equal(data.length, 1,"Number of article for sale must be 1");
          assert.equal(data[0].toNumber(), 1,"Article id must be 1");
          return chainListInstance.articles(data[0]);
        }).then(function(data){
          assert.equal(data[0].toNumber(), 1,"Article id should be 1");
          assert.equal(data[1], seller,"Seller should be " + seller);
          assert.equal(data[2], 0x0, "Buyer should be empty");
          assert.equal(data[3], articleName1,"article name must be " + articleName1);
          assert.equal(data[4], articleDescription1,"article desc must be " + articleDescription1);
          assert.equal(data[5].toNumber(),web3.toWei(articlePrice1, "ether") ,"article price must be "+ web3.toWei(articlePrice1, "ether"));

        });
    });


        it("Should let us sell a second article", function(){
            return ChainList.deployed().then(function(instance){
              chainListInstance = instance;
              return chainListInstance.sellArticle(articleName2,articleDescription2, web3.toWei(articlePrice2, "ether"), {from : seller});
            }). then(function(receipt){
              assert.equal(receipt.logs.length, 1, " event should be logged");
              assert.equal(receipt.logs[0].event, "LogSellArticle", "event should be named LogSellArticle");
              assert.equal(receipt.logs[0].args._id.toNumber(),2, " article id must be 2");
              assert.equal(receipt.logs[0].args._seller,seller, "event seller must be " + seller);
              assert.equal(receipt.logs[0].args._name,articleName2, "event articleName must be " + articleName2);
              assert.equal(receipt.logs[0].args._price.toNumber(),web3.toWei(articlePrice2, "ether"), "event articlePrice must be " + web3.toWei(articlePrice2, "ether"));
              return chainListInstance.getNumberOfArticles();
            }).then(function(data){
              assert.equal(data.toNumber(), 2,"Number of article must be 2");
              return chainListInstance.getArticlesForSale();
            }).then(function(data){
              assert.equal(data.length, 2,"Number of article for sale must be 2");
              return chainListInstance.articles(data[1]);
            }).then(function(data){
              assert.equal(data[0].toNumber(), 2,"Article id should be 2");
              assert.equal(data[1], seller,"Seller should be " + seller);
              assert.equal(data[2], 0x0, "Buyer should be empty");
              assert.equal(data[3], articleName2,"article name must be " + articleName2);
              assert.equal(data[4], articleDescription2,"article desc must be " + articleDescription2);
              assert.equal(data[5].toNumber(),web3.toWei(articlePrice2, "ether") ,"article price must be "+ web3.toWei(articlePrice2, "ether"));
            });
        });

    it("Should buy an article", function(){
        return ChainList.deployed().then(function(instance){
          chainListInstance = instance;
          sellerBalanceBeforeBuying = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
          buyerBalanceBeforeBuying = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();
          return chainListInstance.buyArticle(1,{from : buyer, value: web3.toWei(articlePrice1, "ether")});
        }). then(function(receipt){
          assert.equal(receipt.logs.length, 1, "event should be logged");
          assert.equal(receipt.logs[0].event, "LogBuyArticle", "event should be named LogBuyArticle");
          assert.equal(receipt.logs[0].args._id.toNumber(),1, "article id should be 1");
          assert.equal(receipt.logs[0].args._seller,seller, "event seller must be " + seller);
          assert.equal(receipt.logs[0].args._buyer,buyer, "event seller must be " + buyer);
          assert.equal(receipt.logs[0].args._name,articleName1, "event articleName must be " + articleName1);
          assert.equal(receipt.logs[0].args._price.toNumber(),web3.toWei(articlePrice1, "ether"), "event articlePrice must be " + web3.toWei(articlePrice1, "ether"));

          sellerBalanceAfterBuying = web3.fromWei(web3.eth.getBalance(seller), "ether").toNumber();
          buyerBalanceAfterBuying = web3.fromWei(web3.eth.getBalance(buyer), "ether").toNumber();

          assert(sellerBalanceAfterBuying == sellerBalanceBeforeBuying + articlePrice1, "seller should have earned article pruce " + articlePrice1);
          assert(buyerBalanceAfterBuying <= buyerBalanceBeforeBuying - articlePrice1, "buyer should have earned article pruce " + articlePrice1);

          return chainListInstance.getArticlesForSale();

        }).then(function(data){
          assert.equal(data.length, 1,"Only one article remain for sale");
          assert.equal(data[0].toNumber(), 2,"Article 2 should be the only article left for sale");
          return chainListInstance.getNumberOfArticles();
        }).then(function(data){
          assert.equal(data.toNumber(), 2,"There should be in total 2 articles");
        });
    });


});
