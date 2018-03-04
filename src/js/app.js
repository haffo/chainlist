App = {
  web3Provider: null,
  contracts: {},
  account : 0x0,
  loading: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    if(typeof web3 !== 'undefined'){
      App.web3Provider = web3.currentProvider;
    }else{
      App.web3Provider = new Web3.providers.HttpProvider("http://localhost:8545");
    }
    web3 = new Web3(App.web3Provider);
    App.displayAccountInfo();
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("ChainList.json", function(ChainListArtifact){
      App.contracts.ChainList = TruffleContract(ChainListArtifact);
      App.contracts.ChainList.setProvider(App.web3Provider);
      App.listenToEvents();
      return App.reloadArticles();
    });
  },

  reloadArticles: function(){
      if(App.loading){
        return;
      }
      App.loading = true;
      App.displayAccountInfo();
      var chainListInstance;

      App.contracts.ChainList.deployed().then(function(instance){
          chainListInstance = instance;
          return chainListInstance.getArticlesForSale();
      }).then(function(articleIds){
        $("#articlesRow").empty();
        for(var i=0; i < articleIds.length; i++){
            var articleId = articleIds[i];
            chainListInstance.articles(articleId.toNumber()).then(function(article){
                App.displayArticle(article[0],article[1], article[3], article[4], article[5]);
            });
        }
        App.loading = false;
      }).catch(function(error){
        console.log(error);
      });
  },

  displayArticle : function(id, seller, name, description, price){
    var articlesRow = $('#articlesRow');
    var etherPrice = web3.fromWei(price, "ether");
    var articleTemplate = $("#articleTemplate");
    articleTemplate.find('.panel-title').text(name);
    articleTemplate.find('.article-description').text(description);
    articleTemplate.find('.article-price').text(etherPrice + "ETH");
    articleTemplate.find('.btn-buy').attr('data-id', id);
    articleTemplate.find('.btn-buy').attr('data-value', etherPrice);

    if(seller === App.account){
      articleTemplate.find('.article-seller').text("You");
      articleTemplate.find('.btn-buy').hide();
    }else {
      articleTemplate.find('.article-seller').text(seller);
      articleTemplate.find('.btn-buy').show();
    }
    articlesRow.append(articleTemplate.html());
  },

  sellArticle: function(){
    var articleName = $("#article_name").val();
    var articleDesc = $("#article_description").val();
    var articlePrice = web3.toWei(parseFloat($("#article_price").val() || 0), "ether");

    if(articleName.trim() == "" || articlePrice === 0){
      return false;
    }

    App.contracts.ChainList.deployed().then(function(instance){
      return instance.sellArticle(articleName,articleDesc,articlePrice, {
        from: App.account,
        gas: 500000
      })
    }).then(function(result){
      //App.reloadArticles();
    }).catch(function(error){
      console.error(error);
    })







  },


  listenToEvents: function(){
    App.contracts.ChainList.deployed().then(function(instance){
      instance.LogSellArticle({},{}).watch(function(error, event){
        if(!error){
          $("#events").append('<li class="list-group-item">' + event.args._name + ' is now for sale </li>');
        }else{
          console.error(error);
        }
        App.reloadArticles();
      });

      instance.LogBuyArticle({},{}).watch(function(error, event){
        if(!error){
          $("#events").append('<li class="list-group-item">' + event.args._buyer +  ' bought ' + event.args._name + ' </li>');
        }else{
          console.error(error);
        }
        App.reloadArticles();
      });

    });
  },

  displayAccountInfo : function(){
    web3.eth.getCoinbase(function(err, account){
      if(err === null){
        App.account = account;
        $("#account").text(account);
        web3.eth.getBalance(account, function(err, balance){
            if(err === null){
              $("#accountBalance").text(web3.fromWei(balance, "ether") + "ETH");
            }
        });
      }
    });
  },

  buyArticle : function(){
    event.preventDefault();
    var price = parseFloat($(event.target).data('value'));
    var id =  $(event.target).data('id');
    App.contracts.ChainList.deployed().then(function(instance){
      return instance.buyArticle(id, {from : App.account, value: web3.toWei(price, "ether"), gas: 500000});
    }).catch(function(error){
      console.error(error);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
