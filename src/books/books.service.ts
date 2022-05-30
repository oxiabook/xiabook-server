import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BooksEntity } from "./books.entity";
import { validate } from "class-validator";
import { HttpException } from "@nestjs/common/exceptions/http.exception";
import { HttpStatus } from "@nestjs/common";

@Injectable()
export class BooksService {
    constructor(
        @InjectRepository(BooksEntity)
        private readonly booksRepository: Repository<BooksEntity>
    ) { }
    /**
     * 新的想看的书
     * @param name
     * @returns
     */
    async newWantBook(name: string): Promise<BooksEntity> {
        // create new user
        const newBook = new BooksEntity();
        newBook.name = name;
        const errors = await validate(newBook);
        if (errors.length > 0) {
            const _errors = { username: "Userinput is not valid." };
            throw new HttpException(
                { message: "Input data validation failed", _errors },
                HttpStatus.BAD_REQUEST
            );
        } else {
            const savedBook = await this.booksRepository.save(newBook);
            return savedBook;
        }
    }
    /**
     * 取得系统中已存储的书籍
     * @param name 
     */
    async getBookByName(name: string): Promise<BooksEntity> {
        // const savedBook = await this.booksRepository.save(newBook);
        const bookEntity = await this.booksRepository.createQueryBuilder('BooksEntity').where('name = :name', { name }).getOne();
        return bookEntity;
    }
    /**
     * 取得站内书籍 心原单
     */
    async getBooks(): Promise<BooksEntity[]> {
        // const savedBook = await this.booksRepository.save(newBook);
        const bookEntitys = await this.booksRepository.createQueryBuilder('BooksEntity').getMany();
        return bookEntitys;
    }

    /**
     * 取得书籍详情
     * @param id 
     * @returns 
     */
    async getBookById(id: number): Promise<BooksEntity>{
        const bookEntity = await this.booksRepository.createQueryBuilder('BooksEntity').where('id = :id', { id }).getOne();
        return bookEntity;
    }

}
