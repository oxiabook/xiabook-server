"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooksQueryEntity = void 0;
const typeorm_1 = require("typeorm");
let BooksQueryEntity = class BooksQueryEntity {
    updateTimestamp() {
        this.updated = new Date();
    }
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BooksQueryEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ length: 32 }),
    __metadata("design:type", String)
], BooksQueryEntity.prototype, "bookName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 12 }),
    __metadata("design:type", String)
], BooksQueryEntity.prototype, "siteKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '', length: 12 }),
    __metadata("design:type", String)
], BooksQueryEntity.prototype, "author", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '', length: 3 }),
    __metadata("design:type", String)
], BooksQueryEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "tinyint",
        default: 0,
        comment: "权重值",
    }),
    __metadata("design:type", Number)
], BooksQueryEntity.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '', length: 128 }),
    __metadata("design:type", String)
], BooksQueryEntity.prototype, "bookimg", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: '', length: 128 }),
    __metadata("design:type", String)
], BooksQueryEntity.prototype, "indexPage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], BooksQueryEntity.prototype, "created", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], BooksQueryEntity.prototype, "updated", void 0);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], BooksQueryEntity.prototype, "updateTimestamp", null);
BooksQueryEntity = __decorate([
    (0, typeorm_1.Entity)('bookquery'),
    (0, typeorm_1.Index)(['bookName', 'siteKey'], { unique: true })
], BooksQueryEntity);
exports.BooksQueryEntity = BooksQueryEntity;
//# sourceMappingURL=booksquery.entity.js.map