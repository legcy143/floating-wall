import { Button } from '@/components/ui/button'
import { CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@radix-ui/react-label'
import React from 'react'

export default function Form({ formData, handleOnChange, handleSubmit, maxLength }: any) {
    return (
        <>
            <section className="flex flex-col gap-3">
                <p className="text-center mb-5">Ready to shine?</p>
                <div className="flex items-center gap-2">
                    <Label className="w-20">
                        Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        className="flex-1"
                        placeholder="Enter your first name"
                        value={formData.name}
                        onChange={(e) => handleOnChange("name", e.target.value)}
                    />
                </div>
                <span className="text-xs text-end w-full block ml-0 mt-[-0.7rem]">
                    {formData.name.length}/{maxLength.name}
                </span>
            </section>
            <CardFooter className="flex flex-row items-center justify-center gap-2 py-2">
                <Button
                    className="px-14 gap-2 text-white bg-[#3f0653]"
                    onClick={handleSubmit}
                >
                     🪔 Light My Lamp
                </Button>
            </CardFooter>
        </>
    )
}
