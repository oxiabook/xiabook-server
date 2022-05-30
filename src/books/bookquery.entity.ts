import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    // OneToOne,
    // ManyToOne,
    // OneToMany,
    // JoinColumn,
    BeforeUpdate,
    Index
} from "typeorm";
// import { ChapterEntity } from './chapter.entity';

@Entity("books")
export class BooksEntity {
    @PrimaryGeneratedColumn()
    readonly id: number;

    @Index({ unique: true })
    @Column()
    public name: string;

    @Column({ default: "" })
    public author: string;

    @Column({ default: "" })
    public description: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    public created: Date;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    public updated: Date;

    @BeforeUpdate()
    updateTimestamp() {
        this.updated = new Date();
    }

    // @Column('simple-array')
    // tagList: string[];

    // @OneToMany(type => ChapterEntity, comment => comment.article, {eager: true})
    // @JoinColumn()
    // comments: Comment[];

    @Column({ default: 0 })
    public complete: number;
}
