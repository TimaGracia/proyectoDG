const path = require("path");
const productModel = require("../models/productModel")
const db = require("../database/models")
const productUtil = require("./productUtil")
const {validationResult} = require("express-validator");
const { resolveNaptr } = require("dns");


let productController = {
    all: async function(req, res){

        let products = await productUtil.apiAll();
        res.send(JSON.stringify(products));

    },
    apiGetById: async function(req, res){
        let product = await db.Product.findByPk(req.params.id);
        res.send(JSON.stringify(product));

    },
    productCart: function(req, res){
        res.render("productCart", {style:"productCart", title: "Carrito de Productos"})
    },
    productDetail: function(req, res){
        res.render("productDetail", {style:"productDetail", title: "Detalle del Producto",productos:productModel.all()})
    },
    productCreate: async function(req, res){
        
        try {
            let categories = await db.Category.findAll();
            res.render("productCreate", {style:"productCreate", title: "Crear y editar Productos", categories: categories})//, {select: "select"}
            
        } catch (error) {
            console.log(error);
            
        }
        
    },

    list: async function(req, res){

        try {
            let products = await db.Product.findAll({
                include: [{association: "categories"}, {association: "business"}]
            });
            //productos:productModel.all()
            res.render("products", {productos:products, style:"list",title: "Listado de Productos"})
            
        } catch (error) {
            console.log(error);
            
        }
        
    }, 
    create: function(req, res){
        //console.log(req.body)
        let errors = validationResult(req);
        console.log(errors);

        if (errors.isEmpty()){
            let file = req.file;
            let img;
            if (file){
                img = "/uploads/products/"+file.filename;
            } else img = "/uploads/products/default.jpg";
    
            db.Product.create({
                idBusiness: 1,
                name: req.body.name,
                description: req.body.description,
                stock:req.body.stock,
                image:img,
                idCategory:1,
                price:req.body.price,
            })
    
            return res.redirect("/products")
        } else {
            console.log(req.body)
            res.render("productCreate", {style:"productCreate", title: "Crear y editar Productos", errors:errors.mapped(), old:req.body});//errors:errors.array()
            
        }
        //let saved = productModel.create(req.body,req.file)
        //redirect("products")
       // return saved ? res.redirect("products/"+saved.id) : res.status(500).send("Error en el servidor");
    },
    addToCart: async function (req, res) {


        try {
            //console.log(req)
            console.log("El usuario logueado es: "+req.session)

            let registry = await db.ProductCart.create({
                idUser: req.body.user, 
                idProduct: req.body.product, 
                cant: 5
            })
            
        } catch (error) {
            console.log(error);
            
        }



    },
    getById: async function(req, res){
        //console.log(req.params.id)
        let productos = await productUtil.all();
        console.log("Esto son los productos"+productos);
        
        try {
            let productId = await db.Product.findByPk(req.params.id);
            res.render("productDetail", {product: productId,productos: productUtil.all(), style:"productDetail", title: "Detalle del Producto"})
            
        } catch (error) {
            console.log(error);
            
        }


        //res.render("productDetail", {product:productModel.getById(req.params.id),productos:productModel.all(), style:"productDetail", title: "Detalle del Producto"})
    },
    getByIdEdit: async function(req, res){
        //console.log(req.params.id)
        let productId = await db.Product.findByPk(req.params.id);
        res.render("productEdit", {product:productId, style:"productEdit",productos:productUtil.all(), title: "Editar el Producto"})
    },
    delete: async function (req, res){
    
        let deleted = await db.Product.destroy({
            where: {
                idProduct: req.params.id}
        });// productModel.delete(req.params.id);
        
        return deleted ? res.redirect("/products") : res.status(500).send("Error en el servidor");
    },
    update: async function (req, res){
        
        let updated  = await db.Product.update({
            idBusiness: 1,
            name: req.body.name,
            description: req.body.description,
            stock:req.body.stock,
            idCategory:1,
            price:req.body.price,
        },{
            where: {idProduct: req.params.id}
        })

        let idUpdate = req.params.id;
        //console.log(req.body);
        //let updated = productModel.update(req.body, idUpdate);
        return updated ? res.redirect("/products/"+idUpdate) : res.status(500).send("Error en el servidor");
    }, 
    listBusiness: async function(req, res){

        try {
            let business = await db.Business.findAll({
                //include: [{association: "categories"}, {association: "business"}]
            });
            //productos:productModel.all()
            res.render("bodegas", {business:business, style:"bodegas",title: "Listado de Empresas"})
            
        } catch (error) {
            console.log(error);
            
        }
        
    }, 

}

module.exports = productController;
