import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    // OneToOne,
    // ManyToOne,
    // OneToMany,
    // JoinColumn,
    BeforeUpdate,
    Index,
} from 'typeorm';
import { BookQueryVO } from '../spider/spider.define';
// import { ChapterEntity } from './chapter.entity';
@Entity('bookquery')
@Index(['bookName', 'siteKey'], { unique: true })
export class BooksQueryEntity implements BookQueryVO {
    @PrimaryGeneratedColumn()
    public id: number;

    @Index()
    @Column({ length: 32 })
    public bookName: string;

    @Column({ length: 12 })
    public siteKey: string;

    @Column({ default: '', length: 12 })
    public author: string;

    @Column({ default: '', length: 3 })
    public status: string;
    @Column({
        type: "tinyint",
        default:0,
        comment: "权重值",
    })
    public weight:number;

    @Column({ default: '', length: 128 })
    public bookimg: string;

    @Column({ default: '', length: 128 })
    public indexPage: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    private created: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    private updated: Date;

    @BeforeUpdate()
    updateTimestamp() {
        this.updated = new Date();
    }

}
