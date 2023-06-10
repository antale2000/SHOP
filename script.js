Vue.component('products', {
  
  ready: function () {
    var self = this;
    document.addEventListener("keydown", function(e) {
      if (self.showModal && e.keyCode == 37) {
        self.changeProductInModal("prev");
      } else if (self.showModal && e.keyCode == 39) {
        self.changeProductInModal("next");
      } else if (self.showModal && e.keyCode == 27) {
        self.hideModal();
      }
    });
  },

  template: "<h1>Productos</h1>" + 
  "<div class='products'>" +
  "<div v-for='product in productsData' track-by='$index' class='product {{ product.product | lowercase }}'>" + 
  "<div class='image' @click='viewProduct(product)' v-bind:style='{ backgroundImage: \"url(\" + product.image + \")\" }' style='background-size: cover; background-position: center;'></div>" +
  "<div class='name'>{{ product.product }}</div>" +
  "<div class='description'>{{ product.description }}</div>" +
  "<div class='price'>{{ product.price | currency }}</div>" +
  "<button @click='addToCart(product)'>Añadir al carrito</button><br><br></div>" +
  "</div>" +
  "<div class='modalWrapper' v-show='showModal'>" +
  "<div class='prevProduct' @click='changeProductInModal(\"prev\")'><i class='fa fa-angle-left'></i></div>" +
  "<div class='nextProduct' @click='changeProductInModal(\"next\")'><i class='fa fa-angle-right'></i></div>" +
  "<div class='overlay' @click='hideModal()'></div>" + 
  "<div class='modal'>" + 
  "<i class='close fa fa-times' @click='hideModal()'></i>" + 
  "<div class='imageWrapper'><div class='image' v-bind:style='{ backgroundImage: \"url(\" + modalData.image + \")\" }' style='background-size: cover; background-position: center;' v-on:mouseover='imageMouseOver($event)' v-on:mousemove='imageMouseMove($event)' v-on:mouseout='imageMouseOut($event)'></div></div>" +
  "<div class='additionalImages' v-if='modalData.images'>" + 
  "<div v-for='image in modalData.images' class='additionalImage' v-bind:style='{ backgroundImage: \"url(\" + image.image + \")\" }' style='background-size: cover; background-position: center;' @click='changeImage(image.image)'></div>" +
  "</div>" +
  "<div class='name'>{{ modalData.product }}</div>" +
  "<div class='description'>{{ modalData.description }}</div>" +
  "<div class='details'>{{ modalData.details }}</div>" +
  "<h3 class='price'>{{ modalData.price | currency }}</h3>" +
  "<label for='modalAmount'>Cantidad:</label>" +
  "<input id='modalAmount' value='{{ modalAmount }}' v-model='modalAmount' class='amount' @keyup.enter='modalAddToCart(modalData), hideModal()'/>" +
  "<button @click='modalAddToCart(modalData), hideModal()'>Añadir al carrito</button>" +
  "</div></div>",

  props: ['productsData', 'cart', 'tax', 'cartSubTotal', 'cartTotal'],

  data: function() {
    return {
      showModal: false,
      modalData: {},
      modalAmount: 1,
      timeout: "",
      mousestop: ""
    }
  },

  methods: {
    addToCart: function(product) {
      var found = false;

      for (var i = 0; i < vue.cart.length; i++) {

        if (vue.cart[i].sku === product.sku) {
          var newProduct = vue.cart[i];
          newProduct.quantity = newProduct.quantity + 1;
          vue.cart.$set(i, newProduct);
          //console.log("DUPLICATE",  vue.cart[i].product + "'s quantity is now: " + vue.cart[i].quantity);
          found = true;
          break;
        }
      }

      if(!found) {
        product.quantity = 1;
        vue.cart.push(product);
      }

      vue.cartSubTotal = vue.cartSubTotal + product.price;
      vue.cartTotal = vue.cartSubTotal + (vue.tax * vue.cartSubTotal);
      vue.checkoutBool = true;
    },

    modalAddToCart: function(modalData) {
      var self = this;

      for(var i = 0; i < self.modalAmount; i++) {
        self.addToCart(modalData);
      }

      self.modalAmount = 1;
    },

    viewProduct: function(product) {      
      var self = this;
      //self.modalData = product;
      self.modalData = (JSON.parse(JSON.stringify(product)));
      self.showModal = true;
    },

    changeProductInModal: function(direction) {
      var self = this,
          productsLength = vue.productsData.length,
          currentProduct = self.modalData.sku,
          newProductId,
          newProduct;

      if(direction === "next") {
        newProductId = currentProduct + 1;

        if(currentProduct >= productsLength) {
          newProductId = 1;
        }

      } else if(direction === "prev") {
        newProductId = currentProduct - 1;

        if(newProductId === 0) {
          newProductId = productsLength;
        }
      }

      //console.log(direction, newProductId);

      for (var i = 0; i < productsLength; i++) {
        if (vue.productsData[i].sku === newProductId) {
          self.viewProduct(vue.productsData[i]);
        }
      }
    },

    hideModal: function() {
      //hide modal and empty modal data
      var self = this;
      self.modalData = {};
      self.showModal = false;
    },

    changeImage: function(image) {
      var self = this;
      self.modalData.image = image;
    },

    imageMouseOver: function(event) {
      event.target.style.transform = "scale(2)";
    },

    imageMouseMove: function(event) {
      var self = this;
      
      event.target.style.transform = "scale(2)";
      
      self.timeout = setTimeout(function() {
        event.target.style.transformOrigin = ((event.pageX - event.target.getBoundingClientRect().left) / event.target.getBoundingClientRect().width) * 100 + '% ' + ((event.pageY - event.target.getBoundingClientRect().top - window.pageYOffset) / event.target.getBoundingClientRect().height) * 100 + "%";
      }, 50);
      
      self.mouseStop = setTimeout(function() {
        event.target.style.transformOrigin = ((event.pageX - event.target.getBoundingClientRect().left) / event.target.getBoundingClientRect().width) * 100 + '% ' + ((event.pageY - event.target.getBoundingClientRect().top - window.pageYOffset) / event.target.getBoundingClientRect().height) * 100 + "%";
      }, 100);
    },

    imageMouseOut: function(event) {
      event.target.style.transform = "scale(1)";
    }
  }
});

Vue.component('cart', {
  template: '<div class="cart">' + 
  '<span class="cart-size" @click="showCart = !showCart"> {{ cart | cartSize }} </span><i class="fa fa-shopping-cart" @click="showCart = !showCart"></i>' +
  '<div class="cart-items" v-show="showCart">' +
  '<table class="cartTable">' +
  '<tbody>' +
  '<tr class="product" v-for="product in cart">' +
  '<td class="align-left"><div class="cartImage" @click="removeProduct(product)" v-bind:style="{ backgroundImage: \'url(\' + product.image + \')\' }" style="background-size: cover; background-position: center;"><i class="close fa fa-times"></i></div></td>' +
  '<td class="align-center"><button @click="quantityChange(product, \'decriment\')"><i class="close fa fa-minus"></i></button></td>' +
  '<td class="align-center">{{ cart[$index].quantity }}</td>' +
  '<td class="align-center"><button @click="quantityChange(product, \'incriment\')"><i class="close fa fa-plus"></i></button></td>' +
  '<td class="align-center">{{ cart[$index] | customPluralize }}</td>' +
  '<td>{{ product.price | currency }}</td>' +
  '</tbody>' +
  '<table>' +
  '</div>' +
  '<h4 class="cartSubTotal" v-show="showCart"> {{ cartSubTotal | currency }} </h4></div>' +
  '<button class="clearCart" v-show="checkoutBool" @click="clearCart()"> Limpiar Carrito </button>' +
  '<button class="checkoutCart" v-show="checkoutBool" @click="propagateCheckout()"> Verificar </button>',

  props: ['checkoutBool', 'cart', 'cartSize', 'cartSubTotal', 'tax', 'cartTotal'],

  data: function() {
    return {
      showCart: false
    }
  },

  filters: {
    customPluralize: function(cart) {      
      var newName;

      if(cart.quantity > 1) {
        if(cart.product === "Peach") {
          newName = cart.product + "es";
        } else if(cart.product === "Puppy") {
          newName = cart.product + "ies";
          newName = newName.replace("y", "");
        } else {
          newName = cart.product + "s";
        }

        return newName;
      }

      return cart.product;
    },

    cartSize: function(cart) {
      var cartSize = 0;

      for (var i = 0; i < cart.length; i++) {
        cartSize += cart[i].quantity;
      }

      return cartSize;
    }
  },

  methods: {
    removeProduct: function(product) {
      vue.cart.$remove(product);
      vue.cartSubTotal = vue.cartSubTotal - (product.price * product.quantity);
      vue.cartTotal = vue.cartSubTotal + (vue.tax * vue.cartSubTotal);

      if(vue.cart.length <= 0) {
        vue.checkoutBool = false;
      }
    },

    clearCart: function() {
      vue.cart = [];
      vue.cartSubTotal = 0;
      vue.cartTotal = 0;
      vue.checkoutBool = false;
      this.showCart = false;
    },

    quantityChange: function(product, direction) {
      var qtyChange;

      for (var i = 0; i < vue.cart.length; i++) {
        if (vue.cart[i].sku === product.sku) {

          var newProduct = vue.cart[i];

          if(direction === "incriment") {
            newProduct.quantity = newProduct.quantity + 1;
            vue.cart.$set(i, newProduct);

          } else {
            newProduct.quantity = newProduct.quantity - 1;

            if(newProduct.quantity == 0) {
              vue.cart.$remove(newProduct);

            } else {
              vue.cart.$set(i, newProduct);
            }
          }
        }
      }

      if(direction === "incriment") {
        vue.cartSubTotal = vue.cartSubTotal + product.price;

      } else {
        vue.cartSubTotal = vue.cartSubTotal - product.price;
      }

      vue.cartTotal = vue.cartSubTotal + (vue.tax * vue.cartSubTotal);

      if(vue.cart.length <= 0) {
        vue.checkoutBool = false;
      }
    },
    //send our request up the chain, to our parent
    //our parent catches the event, and sends the request back down
    propagateCheckout: function() {
      vue.$dispatch("checkoutRequest");
    }
  }
});

Vue.component('checkout-area', {
  template: "<h1>Area de Verificacion</h1>" + 
  '<div class="checkout-area">' + 
  '<span> {{ cart | cartSize }} </span><i class="fa fa-shopping-cart"></i>' +
  '<table>' +
  '<thead>' +
  '<tr>' +
  '<th class="align-center">SERIE</th>' +
  '<th>NOMBRE</th>' +
  '<th>DESCRIPCION</th>' +
  '<th class="align-right">CANTIDAD</th>' +
  '<th class="align-right">PRECIO</th>' +
  '</tr>' +
  '</thead>' +
  '<tbody>' +
  '<tr v-for="product in cart" track-by="$index">' +
  '<td class="align-center">{{ product.sku }}</td>' +
  '<td>{{ product.product }}</td>' +
  '<td>{{ product.description }}</td>' +
  '<td class="align-right">{{ cart[$index].quantity }}</td>' +
  '<td class="align-right">{{ product.price | currency }}</td>' +
  '</tr>' +
  //'<button @click="removeProduct(product)"> X </button></div>' +
  '<tr>' +
  '<td>&nbsp;</td>' +
  '<td>&nbsp;</td>' +
  '<td>&nbsp;</td>' +
  '<td>&nbsp;</td>' +
  '<td>&nbsp;</td>' +
  '</tr>' +
  '<tr>' +
  '<td></td>' +
  '<td></td>' +
  '<td></td>' +
  '<td class="align-right">Subtotal:</td>' +
  '<td class="align-right"><h4 v-if="cartSubTotal != 0"> {{ cartSubTotal | currency }} </h4></td>' +
  '</tr>' +
  '<tr>' +
  '<td></td>' +
  '<td></td>' +
  '<td></td>' +
  '<td class="align-right">IVA:</td>' +
  '<td class="align-right"><h4 v-if="cartSubTotal != 0"> {{ cartTotal - cartSubTotal | currency }} </h4></td>' +
  '</tr>' +
  '<tr>' +
  '<td></td>' +
  '<td></td>' +
  '<td></td>' +
  '<td class="align-right vert-bottom">Total:</td>' +
  '<td class="align-right vert-bottom"><h2 v-if="cartSubTotal != 0"> {{ cartTotal | currency }} </h2></td>' +
  '</tr>' +
  '</tbody>' +
  '</table>' +
  '<button v-show="cartSubTotal" @click="checkoutModal()">VERIFICAR</button></div>' + 
  "<div class='modalWrapper' v-show='showModal'>" +
  "<div class='overlay' @click='hideModal()'></div>" + 
  "<div class='modal checkout'>" + 
  "<i class='close fa fa-times' @click='hideModal()'></i>" + 
  "<h1>Verificación</h1>" +
  "<div>Aceptamos: <i class='fa fa-stripe'></i> <i class='fa fa-cc-visa'></i> <i class='fa fa-cc-mastercard'></i> <i class='fa fa-cc-amex'></i> <i class='fa fa-cc-discover'></i></div><br>" +
  "<h3> Subtotal: {{ cartSubTotal | currency }} </h3>" +
  "<h3> IVA: {{ cartTotal - cartSubTotal | currency }} </h4>" +
  "<h1> Total: {{ cartTotal | currency }} </h3>" +
  "<br><div>dar click para continuar con el pago</div></br>" +
  '<button>VERIFICAR</button></div>' +
  "</div>",

  props: ['cart', 'cartSize', 'cartSubTotal', 'tax', 'cartTotal'],

  data: function() {
    return {
      showModal: false
    }
  },

  filters: {
    customPluralize: function(cart) {      
      var newName;

      if(cart.quantity > 1) {
        newName = cart.product + "s";
        return newName;
      }

      return cart.product;
    },

    cartSize: function(cart) {
      var cartSize = 0;

      for (var i = 0; i < cart.length; i++) {
        cartSize += cart[i].quantity;
      }

      return cartSize;
    }
  },

  methods: {
    removeProduct: function(product) {
      vue.cart.$remove(product);
      vue.cartSubTotal = vue.cartSubTotal - (product.price * product.quantity);
      vue.cartTotal = vue.cartSubTotal + (vue.tax * vue.cartSubTotal);

      if(vue.cart.length <= 0) {
        vue.checkoutBool = false;
      }
    },

    checkoutModal: function() {
      var self = this;
      self.showModal = true;

      console.log("CHECKOUT", self.cartTotal);

    },

    hideModal: function() {
      //hide modal and empty modal data
      var self = this;
      self.showModal = false;
    }
  },
  
  //intercept the checkout request broadcast
  //run our function
  events: {
    "checkoutRequest": function() {
      var self = this;
      self.checkoutModal();
    }
  }
});

//---------
// Vue init
//---------
Vue.config.debug = false;
var vue = new Vue({
  el: "#vue",

  data: {
    productsData: [
      {
        sku: 1,
        product: "Nike Revolution 6",
        image: "https://siman.vtexassets.com/arquivos/ids/2603852/103609327-1.jpg?v=637799525360700000",
        images: [
          { image: "https://siman.vtexassets.com/arquivos/ids/2603853-1200-auto?v=637799525363200000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603854-1200-auto?v=637799525366200000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603855-1200-auto?v=637799525369300000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603856-1200-auto?v=637799525372900000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603857-1200-auto?v=637799525376970000&width=1200&height=auto&aspect=true" }
        ],
        description: "DAMAS",
        details: "Calzado deportivo atlético Nike Revolution 6 color negro/blanco.",
        price: 500.50
      },

      {
        sku: 2,
        product: "Nike Legend Essential 2",
        image: "https://siman.vtexassets.com/arquivos/ids/2795306-1200-auto?v=637853960562800000&width=1200&height=auto&aspect=true",
        images: [
          { image: "https://siman.vtexassets.com/arquivos/ids/2795307-1200-auto?v=637853960565630000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2795308-1200-auto?v=637853960570000000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2795309-1200-auto?v=637853960572800000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2795310-1200-auto?v=637853960576400000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2795311-1200-auto?v=637853960579370000&width=1200&height=auto&aspect=true" }
        ],
        description: "DAMAS",
        details: "Calzado deportivo atlético Nike Legend Essential 2 color rosado para dama.",
        price: 50.50
      },

      {
        sku: 3,
        product: "NIKE",
        image: "https://siman.vtexassets.com/arquivos/ids/2603852/103609327-1.jpg?v=637799525360700000",
        images: [
          { image: "https://siman.vtexassets.com/arquivos/ids/2603853-1200-auto?v=637799525363200000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603854-1200-auto?v=637799525366200000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603855-1200-auto?v=637799525369300000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603856-1200-auto?v=637799525372900000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603857-1200-auto?v=637799525376970000&width=1200&height=auto&aspect=true" }
        ],
        description: "DAMAS",
        details: "Calzado deportivo atlético Nike Revolution 6 color negro/blanco.",
        price: 5.50
      },

      {
        sku: 4,
        product: "NIKE",
        image: "https://siman.vtexassets.com/arquivos/ids/2603852/103609327-1.jpg?v=637799525360700000",
        images: [
          { image: "https://siman.vtexassets.com/arquivos/ids/3090678-1200-auto?v=637926626573200000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603854-1200-auto?v=637799525366200000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603855-1200-auto?v=637799525369300000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603856-1200-auto?v=637799525372900000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603857-1200-auto?v=637799525376970000&width=1200&height=auto&aspect=true" }
        ],
        description: "DAMAS",
        details: "Calzado deportivo atlético Nike Revolution 6 color negro/blanco.",
        price: 5.50
      },

      {
        sku: 5,
        product: "NIKE",
        image: "https://siman.vtexassets.com/arquivos/ids/2603852/103609327-1.jpg?v=637799525360700000",
        images: [
          { image: "https://siman.vtexassets.com/arquivos/ids/2603853-1200-auto?v=637799525363200000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603854-1200-auto?v=637799525366200000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603855-1200-auto?v=637799525369300000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603856-1200-auto?v=637799525372900000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603857-1200-auto?v=637799525376970000&width=1200&height=auto&aspect=true" }
        ],
        description: "DAMAS",
        details: "Calzado deportivo atlético Nike Revolution 6 color negro/blanco.",
        price: 5.50
      },

      {
        sku: 6,
        product: "NIKE",
        image: "https://siman.vtexassets.com/arquivos/ids/2603852/103609327-1.jpg?v=637799525360700000",
        images: [
          { image: "https://siman.vtexassets.com/arquivos/ids/2603853-1200-auto?v=637799525363200000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603854-1200-auto?v=637799525366200000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603855-1200-auto?v=637799525369300000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603856-1200-auto?v=637799525372900000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603857-1200-auto?v=637799525376970000&width=1200&height=auto&aspect=true" }
        ],
        description: "DAMAS",
        details: "Calzado deportivo atlético Nike Revolution 6 color negro/blanco.",
        price: 5.50
      },

      {
        sku: 7,
        product: "NIKE",
        image: "https://siman.vtexassets.com/arquivos/ids/2603852/103609327-1.jpg?v=637799525360700000",
        images: [
          { image: "https://siman.vtexassets.com/arquivos/ids/2603853-1200-auto?v=637799525363200000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603854-1200-auto?v=637799525366200000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603855-1200-auto?v=637799525369300000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603856-1200-auto?v=637799525372900000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603857-1200-auto?v=637799525376970000&width=1200&height=auto&aspect=true" }
        ],
        description: "DAMAS",
        details: "Calzado deportivo atlético Nike Revolution 6 color negro/blanco.",
        price: 5.50
      },

      {
        sku: 8,
        product: "NIKE",
        image: "https://siman.vtexassets.com/arquivos/ids/2603852/103609327-1.jpg?v=637799525360700000",
        images: [
          { image: "https://siman.vtexassets.com/arquivos/ids/2603853-1200-auto?v=637799525363200000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603854-1200-auto?v=637799525366200000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603855-1200-auto?v=637799525369300000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603856-1200-auto?v=637799525372900000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603857-1200-auto?v=637799525376970000&width=1200&height=auto&aspect=true" }
        ],
        description: "DAMAS",
        details: "Calzado deportivo atlético Nike Revolution 6 color negro/blanco.",
        price: 5.50
      },

      {
        sku: 9,
        product: "NIKE",
        image: "https://siman.vtexassets.com/arquivos/ids/2603852/103609327-1.jpg?v=637799525360700000",
        images: [
          { image: "https://siman.vtexassets.com/arquivos/ids/2603853-1200-auto?v=637799525363200000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603854-1200-auto?v=637799525366200000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603855-1200-auto?v=637799525369300000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603856-1200-auto?v=637799525372900000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603857-1200-auto?v=637799525376970000&width=1200&height=auto&aspect=true" }
        ],
        description: "DAMAS",
        details: "Calzado deportivo atlético Nike Revolution 6 color negro/blanco.",
        price: 5.50
      },

      {
        sku: 10,
        product: "NIKE",
        image: "https://siman.vtexassets.com/arquivos/ids/2603852/103609327-1.jpg?v=637799525360700000",
        images: [
          { image: "https://siman.vtexassets.com/arquivos/ids/2603853-1200-auto?v=637799525363200000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603854-1200-auto?v=637799525366200000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603855-1200-auto?v=637799525369300000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603856-1200-auto?v=637799525372900000&width=1200&height=auto&aspect=true" },
          { image: "https://siman.vtexassets.com/arquivos/ids/2603857-1200-auto?v=637799525376970000&width=1200&height=auto&aspect=true" }
        ],
        description: "DAMAS",
        details: "Calzado deportivo atlético Nike Revolution 6 color negro/blanco.",
        price: 5.50
      }
    ],
    checkoutBool: false,
    cart: [],
    cartSubTotal: 0,
    tax: 0.065,
    cartTotal: 0
  },
  
  //intercept the checkout request dispatch
  //send it back down the chain
  events: {
    "checkoutRequest": function() {
      vue.$broadcast("checkoutRequest");
    }
  }
});