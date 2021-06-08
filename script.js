function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  e.style.marginTop = '15px';
  return e;
}

function createProductItemElement({ id: sku, title: name, thumbnail: image }) {
  const section = document.createElement('section');
  section.className = 'item';
  section.style.padding = '10px';
  // section
  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section
    .appendChild(createCustomElement('button', 'btn btn-success btn-sm', 'Adicionar ao carrinho!'));

  return section;
}

async function getSkuFromProductItem(item) {
  return item.id;
}

async function changePrice(salePrice) { // total preço
  // eslint-disable-next-line sonarjs/no-duplicate-string
  const total = document.querySelector('.total-price');
  const numberTotal = parseFloat(total.innerHTML);
  const numberPrice = salePrice.price;
  total.innerHTML = numberTotal + numberPrice;
  if (total.innerHTML < 0) {
    total.innerHTML = 0;
  }
}

async function cartItemClickListener(event) { // remove no click
  // coloque seu código aqui
  const text = await event.path[0].innerText;
  const num = await text.substring(text.indexOf('$') + 1);
  await changePrice({ price: (num * (-1)) });
  await event.path[0].remove();
  localStorage.removeItem(event.path[0].id);
}

function clearCarShopping() { // limpa carrinho
  const itemLi = document.querySelectorAll('.cart__item');
  for (let index = 0; index < itemLi.length; index += 1) {
    itemLi[index].remove();
    localStorage.clear();
  }
  const total = document.querySelector('.total-price');
  total.innerHTML = 0;
}

async function getProductID(id) { // pegar produto id
  const item = await fetch(`https://api.mercadolibre.com/items/${id}`);
  const itemJson = await item.json();
  return itemJson;
}

async function createCartItemElement({ id: sku, title: name, price: salePrice, thumbnail: image }) {
  const li = document.createElement('li');
  const div = document.createElement('div');
  li.className = 'cart__item';
  li.id = sku;
  li.style.borderBottom = '1px solid gray';
  li.style.margin = '5px';
  li.style.padding = '5px';
  li.style.display = 'block';
  li.style.background = 'rgb(236, 236, 236)';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  div.style.order = '1';
  div.appendChild(createProductImageElement(image));
  li.appendChild(div);
  li.addEventListener('click', cartItemClickListener);
  localStorage.setItem(li.id, li); // add local storage
  await changePrice(await getProductID(await getSkuFromProductItem(li))); // total preço
  return li;
}

async function getListProducts() {  
  const endPoint = await fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador');
  const products = await endPoint.json();
  const span = document.querySelector('.items');
  products.results.forEach((product) => {
    span.appendChild(createProductItemElement(product));
  });
  return span;
}

async function addShoppingCart(product) {
  const ol = document.querySelector('.cart__items');
  ol.appendChild(await createCartItemElement(product));
}

async function rendersAfterLoading(index) { // renderiza carrinho no onload
  let total = 0;
  const key = localStorage.key(index);
  if (key !== null) {
   await addShoppingCart(await getProductID(key));
  }
  total += parseFloat(total); 
  document.querySelector('.total-price').innerHTML = total;
}

// eslint-disable-next-line max-lines-per-function
window.onload = async function onload() {
  const section = document.querySelector('.items');
  const div = document.createElement('div');
  div.className = 'loading';
  div.innerHTML = 'Loading';
  section.appendChild(div);
  setTimeout(async () => {
    div.remove();
    const products = await getListProducts();
    for (let index = 0; index < products.children.length; index += 1) {
      products.children[index].lastChild.addEventListener('click', async (buttonEvent) => {
        const itemJson = await getProductID(buttonEvent.path[1].firstChild.innerText);
        await addShoppingCart(itemJson);
      });
      rendersAfterLoading(index);
    }
    const clearButton = document.querySelector('.empty-cart');
    clearButton.addEventListener('click', clearCarShopping);
  }, 1000);
  const fundo = document.querySelector('#fundo');
  const modal = document.querySelector('#modal');
  const abrir = document.querySelector('#abrir');
  const fechar = document.querySelector('#fechar');
  console.log(fechar);
  abrir.addEventListener('click', () => {
    fundo.style.display = 'block';  
    modal.style.display = 'block';
  });
  
  fechar.addEventListener('click', () => {
    fundo.style.display = 'none';  
    modal.style.display = 'none';
  });
};
