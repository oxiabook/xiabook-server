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
exports.CacheService = void 0;
const decorators_1 = require("@nestjs/common/decorators");
const nestjs_redis_1 = require("nestjs-redis");
let CacheService = class CacheService {
    constructor(redisService) {
        this.redisService = redisService;
        this.getClient();
    }
    getClient() {
        return __awaiter(this, void 0, void 0, function* () {
            this.client = yield this.redisService.getClient();
        });
    }
    set(key, value, seconds) {
        return __awaiter(this, void 0, void 0, function* () {
            value = JSON.stringify(value);
            if (!this.client) {
                yield this.getClient();
            }
            if (!seconds) {
                yield this.client.set(key, value);
            }
            else {
                yield this.client.set(key, value, 'EX', seconds);
            }
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client) {
                yield this.getClient();
            }
            const data = yield this.client.get(key);
            if (data) {
                return JSON.parse(data);
            }
            else {
                return null;
            }
        });
    }
    del(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.client) {
                yield this.getClient();
            }
            yield this.client.del(key);
        });
    }
};
CacheService = __decorate([
    (0, decorators_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_redis_1.RedisService])
], CacheService);
exports.CacheService = CacheService;
//# sourceMappingURL=cache.service.js.map