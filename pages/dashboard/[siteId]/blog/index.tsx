import { Heading2 } from '@/components/ui/Typography';
import DashboardLayout from '@/layouts/DashboardLayout';
import { Blog } from '@prisma/client';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Empty from '@/components/Empty';
import { Button } from '@/components/ui/Button';
import { Plus } from 'react-feather';
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
} from '@/components/ui/Dialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CustomLink } from '@/components/ui/Link';
import Loader from '@/components/ui/Loader';

interface NewBlogProps {
  title: string;
  description: string;
}

const BlogPage = () => {
  const router = useRouter();
  const siteId = router.query.siteId as string;
  const { data, mutate, error } = useSWR<Blog[]>(
    `/api/get/blogs/?siteId=${siteId}`
  );

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<NewBlogProps>({
    resolver: zodResolver(
      z.object({
        title: z.string().min(1, 'Title is required'),
        description: z.string().min(1, 'Description is required'),
      })
    ),
  });

  return (
    <DashboardLayout
      title='Blogs'
      subtitle='Feedbacks that people submitted through the documentation website'
      active='blog'>
      <div className='max-w-3xl'>
        <div className='w-full flex flex-wrap items-center justify-between'>
          <Heading2>All Blogs</Heading2>
          <DialogRoot>
            <DialogTrigger>
              <Button className='block'>
                <Plus className='inline-block' /> New Blog
              </Button>
            </DialogTrigger>
            <DialogContent title='Create new blog'>
              <form
                onSubmit={handleSubmit((formData: NewBlogProps) => {
                  const req = axios
                    .post(`/api/create/blog`, {
                      title: formData.title,
                      description: formData.description,
                      siteId: siteId,
                    })
                    .then(({ data }: { data: Blog }) => {
                      router.push(`/dashboard/${siteId}/blog/${data?.id}`);
                    });
                  toast.promise(req, {
                    success: 'Blog created!',
                    error: 'Error creating blog',
                    loading: 'Creating blog...',
                  });
                })}>
                <div>
                  <label htmlFor='title'>Blog title</label>
                  <input
                    className='w-full text-input'
                    id='title'
                    placeholder='Hello Hyperdocs'
                    {...register('title')}
                  />
                  <p className='text-red-400 mt-1 text-xs'>
                    {errors.title?.message}
                  </p>
                </div>
                <div className='my-5'>
                  <label htmlFor='description'>Blog description</label>
                  <input
                    className='w-full text-input'
                    id='description'
                    placeholder='Introducing Hyperdocs - The simplest way to create documentation websites'
                    {...register('description')}
                  />
                  <p className='text-red-400 mt-1 text-xs'>
                    {errors.description?.message}
                  </p>
                </div>
                <Button type='submit'>Create blog</Button>
              </form>
            </DialogContent>
          </DialogRoot>
        </div>
        <div className='mt-7'>
          {data &&
            data.map((blog: Blog) => (
              <CustomLink
                noInvert
                key={blog.id}
                className='!p-5 my-3'
                href={`/dashboard/${siteId}/blog/${blog.id}`}>
                <h3 className='text-lg font-semibold mb-2'>{blog.title}</h3>
                <p className='text-opacity-50'>{blog.description}</p>
              </CustomLink>
            ))}
          {data?.length == 0 && (
            <div>
              <Empty />{' '}
              <p className='text-center mt-10'>No blogs created yet</p>
            </div>
          )}
          {!data && !error && <Loader />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default BlogPage;
