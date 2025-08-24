from flask import Blueprint, request, jsonify
from pymongo import MongoClient

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client["hospital_db"]

stock_bp = Blueprint('stock_bp', __name__, url_prefix='/appointments')

@stock_bp.route('/manage-stock', methods=['GET', 'POST', 'PUT', 'DELETE'])
def manage_stock():
    stock_collection = db["stock"]

    if request.method == 'GET':
        stocks = list(stock_collection.find({}, {"_id": 0}))
        return jsonify(stocks)

    elif request.method == 'POST':
        data = request.json
        stock_collection.insert_one(data)
        return jsonify({"message": "Stock item added successfully"}), 201

    elif request.method == 'PUT':
        data = request.json
        stock_collection.update_one(
            {"medicineId": data["medicineId"]},
            {"$set": {
                "name": data.get("name"),
                "sku": data.get("sku"),
                "type": data.get("type"),
                "manufacturer": data.get("manufacturer"),
                "price": data.get("price"),
                "quantity": data.get("quantity"),
                "expiryDate": data.get("expiryDate")
            }}
        )
        return jsonify({"message": "Stock updated successfully"})

    elif request.method == 'DELETE':
        medicine_id = request.args.get("medicineId")
        if not medicine_id:
            return jsonify({"error": "medicineId is required"}), 400
        result = stock_collection.delete_one({"medicineId": medicine_id})
        if result.deleted_count == 0:
            return jsonify({"message": "No stock item found"}), 404
        return jsonify({"message": "Stock item deleted successfully"})
