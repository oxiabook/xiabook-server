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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BooksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const books_entity_1 = require("./books.entity");
const class_validator_1 = require("class-validator");
const http_exception_1 = require("@nestjs/common/exceptions/http.exception");
const common_2 = require("@nestjs/common");
let BooksService = class BooksService {
    constructor(booksRepository) {
        this.booksRepository = booksRepository;
    }
    newWantBook(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const newBook = new books_entity_1.BooksEntity();
            newBook.name = name;
            const errors = yield (0, class_validator_1.validate)(newBook);
            if (errors.length > 0) {
                const _errors = { username: "Userinput is not valid." };
                throw new http_exception_1.HttpException({ message: "Input data validation failed", _errors }, common_2.HttpStatus.BAD_REQUEST);
            }
            else {
                const savedBook = yield this.booksRepository.save(newBook);
                return savedBook;
            }
        });
    }
    getBookByName(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookEntity = yield this.booksRepository.createQueryBuilder('BooksEntity').where('name = :name', { name }).getOne();
            return bookEntity;
        });
    }
    getBooks() {
        return __awaiter(this, void 0, void 0, function* () {
            const bookEntitys = yield this.booksRepository.createQueryBuilder('BooksEntity').getMany();
            return bookEntitys;
        });
    }
    getBookById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const bookEntity = yield this.booksRepository.createQueryBuilder('BooksEntity').where('id = :id', { id }).getOne();
            return bookEntity;
        });
    }
};
BooksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(books_entity_1.BooksEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], BooksService);
exports.BooksService = BooksService;
//# sourceMappingURL=books.service.js.map