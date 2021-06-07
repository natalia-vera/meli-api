const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;
const request = require("request");

app.use(cors());

//Devuelve el listado de productos limitando a una respuesta de 4 items
// /api/items?q=:query
app.get('/api/items', function (req, res) {
    let qQuery = req.query.q;
    let uri = 'https://api.mercadolibre.com/sites/MLA/search?q=' + qQuery + '&limit=4';
    request(uri, function (err, resr, body) {
        // Respuesta
        let parsed = JSON.parse(resr.body);
        // Estructura de retorno
        let respuestaSearch = {
            author: {
                name: 'Natalia',
                lastname: 'Vera'
            },
            categories: [],
            items: []
        }
        // Categorías
        parsed.filters.forEach(element => {
            if (element.id === "category") {
                element.values.forEach(category => {
                    category.path_from_root.forEach(categoryRoot => {
                        respuestaSearch.categories.push(categoryRoot.name);
                    });
                });
            }
        });
        // Items
        parsed.results.forEach(element => {
            respuestaSearch.items.push({
                id: element.id,
                title: element.title,
                price: {
                         currency: element.currency_id,
                         amount: Math.trunc(element.price),
                         decimals: parseInt(element.price.toString().split('.')[1])
                       },
                picture: element.thumbnail,
                condition: element.condition,
                free_shipping: element.shipping.free_shipping,
                address: element.address.state_name
            });
        });
        res.send(respuestaSearch);
    });
});

//Devuelve el detalle de un producto a partir de un id
// /api/items/:id
app.get('/api/items/:id', function (req, res) {
    let idParam = req.params.id;
    let uriItem = 'https://api.mercadolibre.com/items/' + idParam;
    let uriDescripcion = 'https://api.mercadolibre.com/items/' + idParam + '/description';
    request(uriItem, function (errItem, resItem, bodyItem) {
        // Respuesta
        let itemParsed = JSON.parse(resItem.body);
        if (itemParsed.error) {
            res.status(404).send(itemParsed.message? itemParsed.message : 'Se produjo un error al tratar de consumir el servicio.');
            return;
        }
        request(uriDescripcion, function (errDescripcion, resDescripcion, bodyDescripcion) {
            // Respuesta
            let itemDescripcion = JSON.parse(resDescripcion.body);
            let uriCategoria = 'https://api.mercadolibre.com/categories/' + itemParsed.category_id;
            request(uriCategoria, function (errCategoria, resCategoria, bodyCategoria) {
                // Respuesta
                let categoria = JSON.parse(resCategoria.body);
                // Estructura de retorno
                let respuestaSearch = {
                    author: {
                        name: 'Natalia',
                        lastname: 'Vera'
                    },
                    item: {
                        id: itemParsed.id,
                        title: itemParsed.title,
                        price: {
                                currency: itemParsed.currency_id,
                                amount: Math.trunc(itemParsed.price),
                                decimals: parseInt(itemParsed.toString().split('.')[1])
                            },
                        picture: itemParsed.thumbnail,
                        condition: itemParsed.condition,
                        free_shipping: itemParsed.shipping.free_shipping,
                        sold_quantity: itemParsed.sold_quantity,
                        description: itemDescripcion.plain_text,
                        categories: []
                    }
                }
                categoria.path_from_root.forEach(categoryRoot => {
                    respuestaSearch.item.categories.push(categoryRoot.name);
                });
                res.send(respuestaSearch);
            });
        });
    });
});

app.listen(port, () => console.log(`API app listening on port ${port}!`))

