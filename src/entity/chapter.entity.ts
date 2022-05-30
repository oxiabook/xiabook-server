/**
 * 小说章节
 */
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    // OneToOne,
    // ManyToOne,
    // OneToMany,
    // JoinColumn,
    // AfterUpdate,
    BeforeUpdate,
    Index,
} from 'typeorm';

@Entity('chapter')
@Index(["bookName", "indexId", "title"], { unique: true })
export class ChapterEntity {
    @PrimaryGeneratedColumn()
    readonly id: number;

    @Column()
    @Index({})
    public bookName: string;

    /**
     *书籍本身的索引id 第x章
     *
     * @type {number}
     * @memberof ChapterEntity
     */
    @Column()
    public indexId: number;

    @Column()
    public title: string;

    /**
     *是否已拉取
     *
     * @type {number}
     * @memberof ChapterEntity
     */
    @Column({ default: 0 })
    public isFetched: number;

    /**
     * 是否有错
     * 1为错 0为正确 有错就需纠错
     * @type {string}
     * @memberof ChapterEntity
     */
    @Column({ default: 0 })
    public isValid: number;
    /**
     * 采集来源
     * SiteKey 如果发现有错则重新换个site采集
     * @type {string}
     * @memberof ChapterEntity
     */
    @Column()
    public siteKey: string;

    /**
     * 章节网址
     *
     * @type {string}
     * @memberof ChapterEntity
     */
    @Column({ default: '', length: 128 })
    public chapterURL: string;

    @Column({ default: '' })
    public description: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    public created: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    public updated: Date;

    @BeforeUpdate()
    updateTimestamp() {
        this.updated = new Date();
    }
}
